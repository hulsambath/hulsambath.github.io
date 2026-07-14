# Match-detail Panel + SofaScore Detail Ingestion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a SofaScore-style match-detail experience — click a match to open a detail panel (right column on desktop, bottom drawer on mobile) with lineups, timeline, stats, head-to-head, and team form — backed by new SofaScore detail ingestion, a match-detail API, and a backend team-crest image proxy.

**Architecture:** Backend adds a `MatchDetail` blob table, pure SofaScore detail parsers, a `fetch_match_detail` fetch+upsert with status-based TTL, a `GET /matches/{id}/detail` endpoint (hybrid: curated pre-pulled by a new job, others fetched on-demand), and a `GET /teams/{id}/image` disk-cached crest proxy. Frontend adds `MatchDetailPanel` + section subcomponents, a master-detail layout with `selectedMatchId`, logo-proxy wiring in `TeamBadge`, and tested pure helpers.

**Tech Stack:** Backend FastAPI + SQLAlchemy async + Postgres, curl_cffi SofaScore client, pytest. Frontend Next.js 16 / React 19 / TS / Tailwind, vitest.

## Global Constraints

- Two repos: backend `football-predictor/` (branch off `main`), frontend `my-portfolio/` (branch `feat/match-detail`). Never touch other workspace projects.
- Backend gate per task: `.venv/bin/python -m pytest -q` green. Frontend gate: `npx vitest run` green + `npx tsc --noEmit` clean; final task also `npm run build`. (`npm run lint` is repo-broken and TS-blind — do not use it.)
- SofaScore client is curl_cffi with `impersonate="chrome"`; every sub-call must degrade to an empty section on failure, never raise (mirror existing `_get` returning None).
- Detail freshness TTL by match status: live → 60s, upcoming → 3600s, finished → never stale. Live = `isLive` set `{not in NOT_LIVE}`; finished = `{FT,AET,PEN}`.
- New tables are created by `init_db.py`'s `Base.metadata.create_all` (no Alembic); the Heroku `release` phase runs it. `create_all` only adds new tables — safe.
- Frontend API base: `apiBase()` in `app/predictor/page.tsx` (already exists).
- Crest URL: `${apiBase()}/teams/${team.api_team_id}/image`.

---

### Task 1: Team crest image proxy

**Files:**
- Modify: `football-predictor/app/ingest/sofascore.py` (add `SofascoreClient.image_bytes`)
- Create: `football-predictor/app/routers/teams.py`
- Modify: `football-predictor/app/main.py` (register router)
- Test: `football-predictor/tests/test_teams.py`

**Interfaces:**
- Produces: `SofascoreClient.image_bytes(team_id: int) -> bytes | None`; `GET /teams/{team_id}/image` → image bytes (`image/png`) with `Cache-Control: public, max-age=604800`, 404 when unavailable. Disk cache at `settings.cache_dir / "logos" / f"{team_id}.png"`.

- [ ] **Step 1: Write the failing test** — `tests/test_teams.py`

```python
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings


@pytest.fixture
def logo_dir(tmp_path, monkeypatch):
    d = tmp_path / "cache"
    monkeypatch.setattr(settings, "cache_dir", d)
    (d / "logos").mkdir(parents=True)
    return d / "logos"


def test_image_served_from_disk_cache(logo_dir):
    (logo_dir / "42.png").write_bytes(b"\x89PNG\r\n\x1a\nCACHED")
    with TestClient(app) as client:
        r = client.get("/teams/42/image")
        assert r.status_code == 200
        assert r.content.endswith(b"CACHED")
        assert r.headers["cache-control"] == "public, max-age=604800"


def test_missing_image_returns_404(logo_dir, monkeypatch):
    # no disk cache, and the fetch yields nothing
    import app.routers.teams as teams
    async def fake_fetch(_id): return None
    monkeypatch.setattr(teams, "_fetch_bytes", fake_fetch)
    with TestClient(app) as client:
        assert client.get("/teams/999/image").status_code == 404
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv/bin/python -m pytest tests/test_teams.py -q`
Expected: FAIL — `/teams/42/image` 404 (router not registered).

- [ ] **Step 3: Add `image_bytes` to the client** — in `app/ingest/sofascore.py`, inside `SofascoreClient`:

```python
    async def image_bytes(self, team_id: int) -> bytes | None:
        try:
            r = await self._http.get(f"{BASE}/team/{team_id}/image")
        except Exception:
            return None
        if r.status_code != 200 or not r.content:
            return None
        return r.content
```

- [ ] **Step 4: Create the router** — `app/routers/teams.py`

```python
from fastapi import APIRouter, Response

from app.config import settings
from app.ingest.sofascore import SofascoreClient

router = APIRouter(prefix="/teams", tags=["teams"])

_CACHE_HEADERS = {"Cache-Control": "public, max-age=604800"}


async def _fetch_bytes(team_id: int) -> bytes | None:
    client = SofascoreClient()
    try:
        return await client.image_bytes(team_id)
    finally:
        await client.close()


@router.get("/{team_id}/image")
async def team_image(team_id: int):
    path = settings.cache_dir / "logos" / f"{team_id}.png"
    if path.exists():
        return Response(path.read_bytes(), media_type="image/png", headers=_CACHE_HEADERS)
    data = await _fetch_bytes(team_id)
    if not data:
        return Response(status_code=404)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return Response(data, media_type="image/png", headers=_CACHE_HEADERS)
```

- [ ] **Step 5: Register the router** — in `app/main.py`, add `teams` to the import and `app.include_router(teams.router)`.

- [ ] **Step 6: Run tests to verify pass**

Run: `.venv/bin/python -m pytest tests/test_teams.py -q`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add app/ingest/sofascore.py app/routers/teams.py app/main.py tests/test_teams.py
git commit -m "feat: team crest image proxy with disk cache"
```

---

### Task 2: MatchDetail model + pure detail parsers

**Files:**
- Modify: `football-predictor/app/models.py` (add `MatchDetail`)
- Create: `football-predictor/app/ingest/sofascore_detail.py` (parsers)
- Test: `football-predictor/tests/test_sofascore_detail.py`

**Interfaces:**
- Produces: `MatchDetail` ORM (match_id PK/FK, lineups/incidents/h2h/home_form/away_form as JSON, fetched_at). Parsers: `parse_lineups(payload) -> dict`, `parse_incidents(payload) -> list`, `parse_h2h(payload) -> list`, `parse_form(events, team_api_id) -> dict`. All tolerate missing keys and return empty structures.

- [ ] **Step 1: Write the failing test** — `tests/test_sofascore_detail.py`

```python
from app.ingest.sofascore_detail import parse_form, parse_h2h, parse_incidents, parse_lineups

LINEUPS = {
    "home": {"formation": "4-3-3", "players": [
        {"player": {"name": "A. Keeper"}, "shirtNumber": 1, "position": "G", "substitute": False},
        {"player": {"name": "B. Sub"}, "shirtNumber": 17, "position": "M", "substitute": True}]},
    "away": {"formation": "4-4-2", "players": [
        {"player": {"name": "C. Striker"}, "shirtNumber": 9, "position": "F", "substitute": False}]},
}
INCIDENTS = {"incidents": [
    {"time": 23, "incidentType": "goal", "isHome": True, "player": {"name": "B. Scorer"}},
    {"time": 45, "incidentType": "card", "isHome": False, "player": {"name": "R. Rough"}, "incidentClass": "yellow"},
    {"time": 60, "incidentType": "period"}]}
H2H = {"events": [
    {"startTimestamp": 1700000000, "homeTeam": {"name": "X"}, "awayTeam": {"name": "Y"},
     "homeScore": {"current": 2}, "awayScore": {"current": 1}}]}
FORM_EVENTS = {"events": [
    {"startTimestamp": 1700000000, "homeTeam": {"id": 7, "name": "Us"}, "awayTeam": {"id": 8, "name": "Them"},
     "homeScore": {"current": 3}, "awayScore": {"current": 0}, "status": {"type": "finished"}}]}


def test_parse_lineups():
    lu = parse_lineups(LINEUPS)
    assert lu["formationHome"] == "4-3-3"
    assert lu["home"][0] == {"name": "A. Keeper", "number": 1, "position": "G", "isStarter": True}
    assert lu["home"][1]["isStarter"] is False
    assert lu["away"][0]["name"] == "C. Striker"


def test_parse_lineups_empty():
    assert parse_lineups({}) == {"formationHome": None, "formationAway": None, "home": [], "away": []}


def test_parse_incidents_keeps_goals_and_cards_only():
    inc = parse_incidents(INCIDENTS)
    assert [i["type"] for i in inc] == ["goal", "card"]
    assert inc[0] == {"minute": 23, "type": "goal", "team": "home", "player": "B. Scorer", "detail": None}
    assert inc[1]["detail"] == "yellow"


def test_parse_h2h():
    h = parse_h2h(H2H)
    assert h[0]["homeGoals"] == 2 and h[0]["awayGoals"] == 1
    assert h[0]["homeName"] == "X"


def test_parse_form():
    f = parse_form(FORM_EVENTS, team_api_id=7)
    assert f["recent"][0]["result"] == "W"
    assert f["recent"][0]["gf"] == 3 and f["recent"][0]["ga"] == 0
    assert f["recent"][0]["opp"] == "Them"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv/bin/python -m pytest tests/test_sofascore_detail.py -q`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the parsers** — `app/ingest/sofascore_detail.py`

```python
"""Pure parsers for SofaScore match-detail feeds (lineups, incidents, h2h,
team form). Every parser tolerates missing/partial payloads and returns an
empty structure rather than raising, so a single absent feed never breaks the
detail endpoint."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def _players(side: dict) -> list[dict]:
    out = []
    for p in side.get("players") or []:
        out.append({
            "name": (p.get("player") or {}).get("name"),
            "number": p.get("shirtNumber"),
            "position": p.get("position"),
            "isStarter": not p.get("substitute", False),
        })
    return out


def parse_lineups(payload: dict) -> dict:
    home, away = payload.get("home") or {}, payload.get("away") or {}
    return {
        "formationHome": home.get("formation"),
        "formationAway": away.get("formation"),
        "home": _players(home),
        "away": _players(away),
    }


_KEEP_INCIDENTS = {"goal", "card"}


def parse_incidents(payload: dict) -> list[dict]:
    out = []
    for i in payload.get("incidents") or []:
        t = i.get("incidentType")
        if t not in _KEEP_INCIDENTS:
            continue
        out.append({
            "minute": i.get("time"),
            "type": t,
            "team": "home" if i.get("isHome") else "away",
            "player": (i.get("player") or {}).get("name"),
            "detail": i.get("incidentClass"),
        })
    out.sort(key=lambda x: (x["minute"] is None, x["minute"] or 0))
    return out


def _iso(ts: Any) -> str | None:
    if not ts:
        return None
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()


def parse_h2h(payload: dict) -> list[dict]:
    out = []
    for e in payload.get("events") or []:
        out.append({
            "date": _iso(e.get("startTimestamp")),
            "homeName": (e.get("homeTeam") or {}).get("name"),
            "awayName": (e.get("awayTeam") or {}).get("name"),
            "homeGoals": (e.get("homeScore") or {}).get("current"),
            "awayGoals": (e.get("awayScore") or {}).get("current"),
        })
    return out


def parse_form(events: dict, team_api_id: int) -> dict:
    recent, nxt = [], None
    for e in events.get("events") or []:
        home, away = e.get("homeTeam") or {}, e.get("awayTeam") or {}
        is_home = home.get("id") == team_api_id
        opp = (away if is_home else home).get("name")
        finished = (e.get("status") or {}).get("type") == "finished"
        if not finished:
            if nxt is None:
                nxt = {"date": _iso(e.get("startTimestamp")), "opp": opp}
            continue
        gf = (e.get("homeScore") if is_home else e.get("awayScore") or {}).get("current")
        ga = (e.get("awayScore") if is_home else e.get("homeScore") or {}).get("current")
        result = "W" if (gf or 0) > (ga or 0) else "L" if (gf or 0) < (ga or 0) else "D"
        recent.append({"date": _iso(e.get("startTimestamp")), "opp": opp,
                       "gf": gf, "ga": ga, "result": result})
    return {"recent": recent[:5], "next": nxt}
```

- [ ] **Step 4: Run parser tests to verify pass**

Run: `.venv/bin/python -m pytest tests/test_sofascore_detail.py -q`
Expected: PASS (5 tests).

- [ ] **Step 5: Add the `MatchDetail` model** — in `app/models.py`, after `MatchStats`:

```python
class MatchDetail(Base):
    __tablename__ = "match_details"

    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"), primary_key=True)
    lineups: Mapped[dict | None] = mapped_column(JSON)
    incidents: Mapped[list | None] = mapped_column(JSON)
    h2h: Mapped[list | None] = mapped_column(JSON)
    home_form: Mapped[dict | None] = mapped_column(JSON)
    away_form: Mapped[dict | None] = mapped_column(JSON)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
```

Ensure `JSON` is imported from `sqlalchemy` at the top of `models.py` (add to the existing sqlalchemy import if absent).

- [ ] **Step 6: Verify table creates cleanly**

Run: `DATABASE_URL="sqlite+aiosqlite:///:memory:" .venv/bin/python -c "import asyncio; from app.db import engine; from app.models import Base; asyncio.run(__import__('app.db', fromlist=['x']) and None) or asyncio.run((lambda: engine.begin().__aenter__())()) if False else None"`

Simpler — run the full suite (conftest creates all tables):
Run: `.venv/bin/python -m pytest tests/test_sofascore_detail.py tests/test_api.py -q`
Expected: PASS (model imports + `create_all` include the new table).

- [ ] **Step 7: Commit**

```bash
git add app/models.py app/ingest/sofascore_detail.py tests/test_sofascore_detail.py
git commit -m "feat: MatchDetail model + pure SofaScore detail parsers"
```

---

### Task 3: fetch_match_detail + `/matches/{id}/detail` endpoint with TTL

**Files:**
- Modify: `football-predictor/app/ingest/sofascore_detail.py` (add `fetch_match_detail`, `upsert_match_detail`, client helpers)
- Modify: `football-predictor/app/ingest/sofascore.py` (add raw-get methods used by fetch)
- Modify: `football-predictor/app/schemas.py` (add `MatchDetailOut`)
- Modify: `football-predictor/app/routers/matches.py` (add detail route)
- Modify: `football-predictor/app/queries.py` (add `fetch_match_detail_row`, staleness helper)
- Test: `football-predictor/tests/test_detail_endpoint.py`

**Interfaces:**
- Consumes: parsers from Task 2; `MatchDetail`, `MatchStats`, `Match` models.
- Produces:
  - Client (in `sofascore.py`): `event_lineups(id)`, `event_incidents(id)`, `event_h2h(id)`, `team_recent(api_id)`, `team_next(api_id)` — each returns parsed dict/list or empty via `_get`.
  - `fetch_match_detail(client, match) -> dict` returns `{lineups, incidents, h2h, home_form, away_form}`.
  - `async upsert_match_detail(session, match, data) -> MatchDetail`.
  - `is_detail_stale(detail: MatchDetail | None, status: str) -> bool`.
  - `GET /matches/{id}/detail` → `MatchDetailOut`.

- [ ] **Step 1: Write the failing test** — `tests/test_detail_endpoint.py`

```python
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

from app.ingest.sofascore_detail import is_detail_stale
from app.models import MatchDetail


def test_staleness_by_status():
    fresh = MatchDetail(match_id=1, fetched_at=datetime.now(timezone.utc))
    old = MatchDetail(match_id=1, fetched_at=datetime.now(timezone.utc) - timedelta(seconds=120))
    assert is_detail_stale(None, "NS") is True
    assert is_detail_stale(fresh, "1H") is False
    assert is_detail_stale(old, "1H") is True         # live TTL 60s
    finished = MatchDetail(match_id=1, fetched_at=datetime.now(timezone.utc) - timedelta(days=9))
    assert is_detail_stale(finished, "FT") is False   # finished never stale
```

(An integration test of the route with a stubbed client is added in Step 6.)

- [ ] **Step 2: Run to verify it fails**

Run: `.venv/bin/python -m pytest tests/test_detail_endpoint.py -q`
Expected: FAIL — `is_detail_stale` not importable.

- [ ] **Step 3: Add client raw methods** — in `app/ingest/sofascore.py`, inside `SofascoreClient`:

```python
    async def event_lineups(self, event_id: int) -> dict:
        return await self._get(f"/event/{event_id}/lineups") or {}

    async def event_incidents(self, event_id: int) -> dict:
        return await self._get(f"/event/{event_id}/incidents") or {}

    async def event_h2h(self, event_id: int) -> dict:
        return await self._get(f"/event/{event_id}/h2h/events") or {}

    async def team_recent(self, team_api_id: int) -> dict:
        return await self._get(f"/team/{team_api_id}/events/last/0") or {}

    async def team_next(self, team_api_id: int) -> dict:
        return await self._get(f"/team/{team_api_id}/events/next/0") or {}
```

- [ ] **Step 4: Add fetch/upsert/staleness** — in `app/ingest/sofascore_detail.py`:

```python
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Match, MatchDetail

_TTL_LIVE = timedelta(seconds=60)
_TTL_UPCOMING = timedelta(seconds=3600)
_FINISHED = {"FT", "AET", "PEN"}
_NOT_LIVE = {"NS", "PST", "CANC", "FT", "AET", "PEN"}


def is_detail_stale(detail: "MatchDetail | None", status: str) -> bool:
    if detail is None or detail.fetched_at is None:
        return True
    if status in _FINISHED:
        return False
    age = datetime.now(timezone.utc) - detail.fetched_at
    ttl = _TTL_UPCOMING if status in _NOT_LIVE else _TTL_LIVE
    return age > ttl


async def fetch_match_detail(client, match: "Match") -> dict:
    event_id = match.api_fixture_id
    lineups = parse_lineups(await client.event_lineups(event_id))
    incidents = parse_incidents(await client.event_incidents(event_id))
    h2h = parse_h2h(await client.event_h2h(event_id))
    home_form = parse_form(await client.team_recent(match.home_team.api_team_id), match.home_team.api_team_id)
    away_form = parse_form(await client.team_recent(match.away_team.api_team_id), match.away_team.api_team_id)
    # merge upcoming fixture into each form's "next"
    for form, team in ((home_form, match.home_team), (away_form, match.away_team)):
        nxt = parse_form(await client.team_next(team.api_team_id), team.api_team_id)
        form["next"] = nxt["next"]
    return {"lineups": lineups, "incidents": incidents, "h2h": h2h,
            "home_form": home_form, "away_form": away_form}


async def upsert_match_detail(session: AsyncSession, match: "Match", data: dict) -> MatchDetail:
    detail = await session.scalar(select(MatchDetail).where(MatchDetail.match_id == match.id))
    if detail is None:
        detail = MatchDetail(match_id=match.id)
        session.add(detail)
    detail.lineups = data["lineups"]
    detail.incidents = data["incidents"]
    detail.h2h = data["h2h"]
    detail.home_form = data["home_form"]
    detail.away_form = data["away_form"]
    detail.fetched_at = datetime.now(timezone.utc)
    await session.flush()
    return detail
```

- [ ] **Step 5: Add `MatchDetailOut` schema** — in `app/schemas.py`:

```python
class MatchDetailOut(BaseModel):
    match: MatchOut
    stats: dict | None = None
    lineups: dict | None = None
    incidents: list | None = None
    h2h: list | None = None
    home_form: dict | None = None
    away_form: dict | None = None
    prediction: PredictionOut | None = None
    odds: OddsOut | None = None
```

- [ ] **Step 6: Add the route** — in `app/routers/matches.py`:

```python
from fastapi import HTTPException

from app.ingest.sofascore import SofascoreClient
from app.ingest.sofascore_detail import fetch_match_detail, is_detail_stale, upsert_match_detail
from app.models import Match, MatchDetail, MatchStats
from app.schemas import MatchDetailOut
from sqlalchemy import select


@router.get("/{match_id}/detail", response_model=MatchDetailOut)
async def match_detail(match_id: int, session: AsyncSession = Depends(get_session)):
    match = await session.get(Match, match_id)
    if match is None:
        raise HTTPException(404, "match not found")
    detail = await session.scalar(select(MatchDetail).where(MatchDetail.match_id == match_id))
    if is_detail_stale(detail, match.status):
        client = SofascoreClient()
        try:
            data = await fetch_match_detail(client, match)
        finally:
            await client.close()
        detail = await upsert_match_detail(session, match, data)
        await session.commit()
    stats = await session.scalar(select(MatchStats).where(MatchStats.match_id == match_id))
    from app.queries import latest_odds, latest_prediction   # reuse existing helpers
    pred = await latest_prediction(session, match_id)
    odds = await latest_odds(session, match_id)
    return MatchDetailOut(
        match=MatchOut.model_validate(match),
        stats=_stats_dict(stats),
        lineups=detail.lineups, incidents=detail.incidents, h2h=detail.h2h,
        home_form=detail.home_form, away_form=detail.away_form,
        prediction=PredictionOut.model_validate(pred) if pred else None,
        odds=OddsOut.model_validate(odds) if odds else None)
```

Add a small `_stats_dict(stats)` helper in `matches.py` mapping `MatchStats`
columns (home/away corners, shots, shots_on_target, possession, xg) to a plain
dict, or `None` when stats is None. Add the needed imports
(`MatchOut, PredictionOut, OddsOut` already used elsewhere in the router file —
confirm and extend the import line).

- [ ] **Step 7: Add integration test** — append to `tests/test_detail_endpoint.py`:

```python
from tests.test_ws import seeded_file_db  # reuse the seeded file DB fixture


class _StubClient:
    async def event_lineups(self, _): return {}
    async def event_incidents(self, _): return {"incidents": []}
    async def event_h2h(self, _): return {"events": []}
    async def team_recent(self, _): return {"events": []}
    async def team_next(self, _): return {"events": []}
    async def close(self): ...


def test_detail_endpoint_fetches_when_missing(seeded_file_db, monkeypatch):
    import app.routers.matches as m
    monkeypatch.setattr(m, "SofascoreClient", lambda: _StubClient())
    with TestClient(app) as client:
        # match id 1 exists in the seeded DB
        r = client.get("/matches/1/detail")
        assert r.status_code == 200
        body = r.json()
        assert body["match"]["id"] == 1
        assert body["incidents"] == []          # from stub
        assert "home_form" in body
```

- [ ] **Step 8: Run tests**

Run: `.venv/bin/python -m pytest tests/test_detail_endpoint.py -q`
Expected: PASS (staleness + integration).

- [ ] **Step 9: Full suite + commit**

```bash
.venv/bin/python -m pytest -q
git add app/ingest/sofascore_detail.py app/ingest/sofascore.py app/schemas.py app/routers/matches.py tests/test_detail_endpoint.py
git commit -m "feat: match detail fetch + /matches/{id}/detail endpoint with TTL"
```

---

### Task 4: Curated detail pre-pull job

**Files:**
- Create: `football-predictor/scripts/sofascore_detail.py`
- Modify: `football-predictor/scripts/full_board_cron.sh` (add `detail` case)
- Modify: `football-predictor/docs/FULL_BOARD_INGEST.md` (schedule note)

**Interfaces:**
- Consumes: `fetch_match_detail`, `upsert_match_detail`, `CURATED_TOURNAMENTS`.

- [ ] **Step 1: Write the job** — `scripts/sofascore_detail.py`

```python
"""Pre-pull match detail (lineups/incidents/h2h/form) for CURATED-league
matches in a [today-2, today+7] window, so they load instantly. Non-curated
matches fill on-demand via the endpoint. Idempotent; commits per match."""

from __future__ import annotations

import asyncio
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from app.db import SessionLocal
from app.ingest.sofascore import CURATED_TOURNAMENTS, SofascoreClient
from app.ingest.sofascore_detail import fetch_match_detail, upsert_match_detail
from app.models import League, Match


async def main() -> None:
    now = datetime.now(timezone.utc)
    lo, hi = now - timedelta(days=2), now + timedelta(days=7)
    client = SofascoreClient()
    n = 0
    try:
        async with SessionLocal() as session:
            curated_ids = list(CURATED_TOURNAMENTS)
            matches = (await session.scalars(
                select(Match).join(League, Match.league_id == League.id)
                .where(League.source == "sofascore",
                       League.api_league_id.in_(curated_ids),
                       Match.kickoff_utc >= lo, Match.kickoff_utc < hi))).all()
            for match in matches:
                data = await fetch_match_detail(client, match)
                await upsert_match_detail(session, match, data)
                await session.commit()
                n += 1
    finally:
        await client.close()
    print(f"detail pre-pull: {n} curated matches")


if __name__ == "__main__":
    asyncio.run(main())
```

- [ ] **Step 2: Add `detail` case to the wrapper** — in `scripts/full_board_cron.sh`, extend the `case`:

```bash
  detail) exec "$PY" scripts/sofascore_detail.py ;;
```

(Insert before the `*)` fallback.)

- [ ] **Step 3: Document the schedule** — in `docs/FULL_BOARD_INGEST.md`, add a crontab row:

```cron
30  3 * * *  DATABASE_URL="postgresql://…" /path/to/football-predictor/scripts/full_board_cron.sh detail
```

with a line: "`detail` — daily; warms lineups/H2H/form/stats for curated leagues so they load instantly. Others fill on-demand."

- [ ] **Step 4: Smoke-run against a dev DB**

```bash
export DATABASE_URL="sqlite+aiosqlite:///$PWD/data/dev.db"
.venv/bin/python scripts/init_db.py
.venv/bin/python scripts/sofascore_detail.py
```
Expected: prints `detail pre-pull: N curated matches` (N may be 0 on an empty dev DB — that's fine; it proves the job wires up and runs).

- [ ] **Step 5: Commit**

```bash
git add scripts/sofascore_detail.py scripts/full_board_cron.sh docs/FULL_BOARD_INGEST.md
git commit -m "ops: curated match-detail pre-pull job"
```

---

### Task 5: Frontend detail types + pure helpers

**Files:**
- Create: `my-portfolio/app/predictor/detail.ts`
- Create: `my-portfolio/app/predictor/detail.test.ts`

**Interfaces:**
- Produces: TS types `MatchDetail`, `Lineups`, `Incident`, `H2HMatch`, `TeamForm`, `FormResult`; helpers `formChip(result): {label,cls}`, `groupIncidents(incidents): {home:Incident[], away:Incident[]}`, `statRows(stats): {label,home,away}[]`.

- [ ] **Step 1: Write the failing test** — `app/predictor/detail.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { formChip, groupIncidents, statRows } from "./detail";

describe("detail helpers", () => {
  it("maps form result to a chip class", () => {
    expect(formChip("W").label).toBe("W");
    expect(formChip("L").cls).toContain("away");
    expect(formChip("D").label).toBe("D");
  });
  it("splits incidents by team preserving order", () => {
    const g = groupIncidents([
      { minute: 10, type: "goal", team: "home", player: "A", detail: null },
      { minute: 20, type: "card", team: "away", player: "B", detail: "yellow" },
    ]);
    expect(g.home).toHaveLength(1);
    expect(g.away[0].player).toBe("B");
  });
  it("builds paired stat rows, skipping all-null stats", () => {
    const rows = statRows({ home_possession: 60, away_possession: 40, home_shots: null, away_shots: null });
    expect(rows.find((r) => r.label === "Possession")).toBeTruthy();
    expect(rows.find((r) => r.label === "Shots")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run app/predictor/detail.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `detail.ts`**

```ts
export type FormResult = "W" | "D" | "L";
export type Incident = { minute: number | null; type: "goal" | "card"; team: "home" | "away"; player: string | null; detail: string | null };
export type H2HMatch = { date: string | null; homeName: string | null; awayName: string | null; homeGoals: number | null; awayGoals: number | null };
export type LineupPlayer = { name: string | null; number: number | null; position: string | null; isStarter: boolean };
export type Lineups = { formationHome: string | null; formationAway: string | null; home: LineupPlayer[]; away: LineupPlayer[] };
export type TeamForm = { recent: { date: string | null; opp: string | null; gf: number | null; ga: number | null; result: FormResult }[]; next: { date: string | null; opp: string | null } | null };
export type MatchStats = Record<string, number | null>;
export type MatchDetail = {
  match: unknown;
  stats: MatchStats | null;
  lineups: Lineups | null;
  incidents: Incident[] | null;
  h2h: H2HMatch[] | null;
  home_form: TeamForm | null;
  away_form: TeamForm | null;
  prediction?: unknown;
  odds?: unknown;
};

export function formChip(result: FormResult): { label: string; cls: string } {
  const cls = result === "W" ? "bg-[hsl(var(--home)/0.2)] text-[hsl(var(--home))]"
    : result === "L" ? "bg-[hsl(var(--away)/0.2)] text-[hsl(var(--away))]"
    : "bg-muted text-muted-foreground";
  return { label: result, cls };
}

export function groupIncidents(incidents: Incident[]): { home: Incident[]; away: Incident[] } {
  return {
    home: incidents.filter((i) => i.team === "home"),
    away: incidents.filter((i) => i.team === "away"),
  };
}

const STAT_LABELS: [string, string][] = [
  ["possession", "Possession"], ["shots", "Shots"],
  ["shots_on_target", "Shots on target"], ["corners", "Corners"], ["xg", "xG"],
];

export function statRows(stats: MatchStats | null): { label: string; home: number | null; away: number | null }[] {
  if (!stats) return [];
  const rows = [];
  for (const [key, label] of STAT_LABELS) {
    const home = stats[`home_${key}`] ?? null;
    const away = stats[`away_${key}`] ?? null;
    if (home == null && away == null) continue;
    rows.push({ label, home, away });
  }
  return rows;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run app/predictor/detail.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/predictor/detail.ts app/predictor/detail.test.ts
git commit -m "feat: frontend match-detail types + pure helpers"
```

---

### Task 6: Team crest logos via the proxy

**Files:**
- Modify: `my-portfolio/app/predictor/page.tsx` (`TeamBadge`)

**Interfaces:**
- Consumes: `apiBase()`, `Team.api_team_id`.

- [ ] **Step 1: Point `TeamBadge` at the proxy** — in `page.tsx`, change the `TeamBadge` image source from `team.logo_url` to the backend proxy, keeping the initials fallback:

```tsx
function TeamBadge({ team }: { team: Team }) {
  const [broken, setBroken] = React.useState(false);
  const initials = team.name.replace(/[^A-Za-z0-9 ]/g, "").split(" ")
    .filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const src = `${apiBase()}/teams/${team.api_team_id}/image`;
  if (!broken)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={28} height={28}
      className="h-7 w-7 shrink-0 rounded-full bg-secondary object-contain p-0.5"
      onError={() => setBroken(true)} />;
  return (
    <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-[11px] font-bold text-muted-foreground">
      {initials || "?"}
    </span>
  );
}
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: clean; `/predictor` prerenders.

- [ ] **Step 3: Commit**

```bash
git add app/predictor/page.tsx
git commit -m "feat: load team crests via backend image proxy"
```

---

### Task 7: MatchDetailPanel + section subcomponents

**Files:**
- Create: `my-portfolio/app/predictor/components/detail/MatchDetailPanel.tsx`
- Create: `my-portfolio/app/predictor/components/detail/DetailHeader.tsx`
- Create: `my-portfolio/app/predictor/components/detail/Timeline.tsx`
- Create: `my-portfolio/app/predictor/components/detail/Lineups.tsx`
- Create: `my-portfolio/app/predictor/components/detail/MatchStatsBars.tsx`
- Create: `my-portfolio/app/predictor/components/detail/HeadToHead.tsx`
- Create: `my-portfolio/app/predictor/components/detail/TeamForm.tsx`

**Interfaces:**
- Consumes: `apiBase()` (import or prop), types + helpers from `detail.ts`.
- Produces: `<MatchDetailPanel matchId={number} onClose={() => void} />` — fetches `/matches/{id}/detail`, renders header + sections; each section renders its own empty state.

- [ ] **Step 1: Section subcomponents** — create each file. `MatchStatsBars.tsx`:

```tsx
import { statRows, type MatchStats } from "../../detail";

export function MatchStatsBars({ stats }: { stats: MatchStats | null }) {
  const rows = statRows(stats);
  if (rows.length === 0) return null;
  return (
    <section className="mb-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Stats</h3>
      <div className="space-y-2">
        {rows.map((r) => {
          const total = (r.home ?? 0) + (r.away ?? 0) || 1;
          const hp = ((r.home ?? 0) / total) * 100;
          return (
            <div key={r.label}>
              <div className="mb-0.5 flex justify-between font-data text-xs">
                <span>{r.home ?? "–"}</span><span className="text-muted-foreground">{r.label}</span><span>{r.away ?? "–"}</span>
              </div>
              <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-[hsl(var(--home))]" style={{ width: `${hp}%` }} />
                <div className="h-full bg-[hsl(var(--away))]" style={{ width: `${100 - hp}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

`Timeline.tsx`:

```tsx
import { groupIncidents, type Incident } from "../../detail";

export function Timeline({ incidents }: { incidents: Incident[] | null }) {
  if (!incidents || incidents.length === 0) return null;
  const icon = (i: Incident) => i.type === "goal" ? "⚽" : i.detail === "red" ? "🟥" : "🟨";
  return (
    <section className="mb-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Timeline</h3>
      <ul className="space-y-1">
        {incidents.map((i, n) => (
          <li key={n} className={`flex items-center gap-2 text-sm ${i.team === "away" ? "flex-row-reverse text-right" : ""}`}>
            <span className="font-data text-xs text-muted-foreground">{i.minute != null ? `${i.minute}'` : ""}</span>
            <span aria-hidden>{icon(i)}</span>
            <span className="truncate">{i.player ?? ""}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

`Lineups.tsx`:

```tsx
import type { Lineups as LineupsT } from "../../detail";

export function Lineups({ lineups }: { lineups: LineupsT | null }) {
  if (!lineups || (lineups.home.length === 0 && lineups.away.length === 0)) return null;
  const col = (players: LineupsT["home"], formation: string | null) => (
    <div className="flex-1">
      <div className="mb-1 font-data text-[11px] text-muted-foreground">{formation ?? ""}</div>
      <ul className="space-y-0.5">
        {players.map((p, i) => (
          <li key={i} className={`flex gap-2 text-sm ${p.isStarter ? "" : "text-muted-foreground"}`}>
            <span className="w-5 font-data text-xs text-muted-foreground">{p.number ?? ""}</span>
            <span className="truncate">{p.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <section className="mb-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Lineups</h3>
      <div className="flex gap-4">
        {col(lineups.home, lineups.formationHome)}
        {col(lineups.away, lineups.formationAway)}
      </div>
    </section>
  );
}
```

`HeadToHead.tsx`:

```tsx
import type { H2HMatch } from "../../detail";

export function HeadToHead({ h2h }: { h2h: H2HMatch[] | null }) {
  if (!h2h || h2h.length === 0) return null;
  return (
    <section className="mb-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Head-to-head</h3>
      <ul className="space-y-1">
        {h2h.slice(0, 8).map((m, i) => (
          <li key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
            <span className="truncate text-right">{m.homeName}</span>
            <span className="font-data font-semibold">{m.homeGoals ?? "–"}–{m.awayGoals ?? "–"}</span>
            <span className="truncate">{m.awayName}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

`TeamForm.tsx`:

```tsx
import { formChip, type TeamForm as TeamFormT } from "../../detail";

export function TeamForm({ home, away, homeName, awayName }: {
  home: TeamFormT | null; away: TeamFormT | null; homeName: string; awayName: string;
}) {
  if (!home && !away) return null;
  const row = (name: string, form: TeamFormT | null) => (
    <div className="mb-2">
      <div className="mb-1 truncate text-sm font-semibold">{name}</div>
      <div className="flex gap-1">
        {(form?.recent ?? []).map((r, i) => {
          const c = formChip(r.result);
          return <span key={i} className={`flex h-5 w-5 items-center justify-center rounded font-data text-[11px] font-bold ${c.cls}`}>{c.label}</span>;
        })}
      </div>
    </div>
  );
  return (
    <section className="mb-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Form</h3>
      {row(homeName, home)}
      {row(awayName, away)}
    </section>
  );
}
```

`DetailHeader.tsx`:

```tsx
import { apiBase } from "../../apiBase";

export function DetailHeader({ detail }: { detail: any }) {
  const m = detail.match;
  const crest = (id: number) => `${apiBase()}/teams/${id}/image`;
  const Side = ({ team, goals }: { team: any; goals: number | null }) => (
    <div className="flex flex-1 flex-col items-center gap-1 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={crest(team.api_team_id)} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
      <span className="text-sm font-semibold leading-tight">{team.name}</span>
    </div>
  );
  return (
    <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
      <Side team={m.home_team} goals={m.home_goals} />
      <div className="font-data text-2xl font-bold tabular-nums">
        {m.home_goals ?? 0}–{m.away_goals ?? 0}
      </div>
      <Side team={m.away_team} goals={m.away_goals} />
    </div>
  );
}
```

- [ ] **Step 2: Extract `apiBase` into a shared module** — create `app/predictor/apiBase.ts` exporting `apiBase()` and `wsBase()` (move the two functions out of `page.tsx`, and re-import them there). This lets detail components share it without importing from `page.tsx` (avoids a circular import).

```ts
export function apiBase(): string {
  if (process.env.NEXT_PUBLIC_PREDICTOR_API) return process.env.NEXT_PUBLIC_PREDICTOR_API;
  if (typeof window !== "undefined" && window.location.hostname.endsWith("hulsambath.me"))
    return "https://predictor-api.hulsambath.me";
  return "http://localhost:8000";
}
export const wsBase = () => apiBase().replace(/^http/, "ws");
```

In `page.tsx`, replace the local `apiBase`/`wsBase` definitions with `import { apiBase, wsBase } from "./apiBase";`.

- [ ] **Step 3: MatchDetailPanel** — `components/detail/MatchDetailPanel.tsx`

```tsx
"use client";

import { X } from "lucide-react";
import * as React from "react";
import { apiBase } from "../../apiBase";
import type { MatchDetail } from "../../detail";
import { DetailHeader } from "./DetailHeader";
import { HeadToHead } from "./HeadToHead";
import { Lineups } from "./Lineups";
import { MatchStatsBars } from "./MatchStatsBars";
import { TeamForm } from "./TeamForm";
import { Timeline } from "./Timeline";

export function MatchDetailPanel({ matchId, onClose }: { matchId: number; onClose: () => void }) {
  const [detail, setDetail] = React.useState<MatchDetail | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let live = true;
    setDetail(null); setError(false);
    fetch(`${apiBase()}/matches/${matchId}/detail`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => { if (live) setDetail(d); })
      .catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [matchId]);

  const m = detail?.match as any;
  return (
    <div className="flex h-full flex-col">
      <button onClick={onClose} aria-label="Close details"
        className="mb-2 ml-auto rounded-full p-1 text-muted-foreground hover:text-foreground lg:hidden">
        <X className="h-5 w-5" />
      </button>
      {error && <p className="py-8 text-center text-sm text-muted-foreground">Details unavailable right now.</p>}
      {!error && !detail && <p className="py-8 text-center text-sm text-muted-foreground">Loading details…</p>}
      {detail && (
        <div className="overflow-y-auto">
          <DetailHeader detail={detail} />
          <Timeline incidents={detail.incidents} />
          <MatchStatsBars stats={detail.stats} />
          <Lineups lineups={detail.lineups} />
          <HeadToHead h2h={detail.h2h} />
          <TeamForm home={detail.home_form} away={detail.away_form}
            homeName={m?.home_team?.name ?? ""} awayName={m?.away_team?.name ?? ""} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add app/predictor/apiBase.ts app/predictor/page.tsx app/predictor/components/detail/
git commit -m "feat: MatchDetailPanel + section subcomponents"
```

---

### Task 8: Master-detail layout wiring

**Files:**
- Modify: `my-portfolio/app/predictor/page.tsx`

**Interfaces:**
- Consumes: `MatchDetailPanel`; existing board render.

- [ ] **Step 1: Add selection state** — in `PredictorPage`, add:

```tsx
const [selectedMatchId, setSelectedMatchId] = React.useState<number | null>(null);
```

- [ ] **Step 2: Make match rows selectable** — change the `renderMatch` callback passed to `CompetitionRow` so clicking selects instead of (or in addition to) inline expand. Simplest: keep `MatchCard` but wrap it so its top-level click also calls `setSelectedMatchId(m.id)`. In the `competitions.map(...)` render, pass:

```tsx
renderMatch={(mm) => (
  <button key={mm.id} onClick={() => setSelectedMatchId(mm.id)} className="block w-full text-left">
    <MatchCard match={mm} league={leagueById.get(mm.league_id)} oddsShown={oddsShown} />
  </button>
)}
```

(If `MatchCard`'s own expand button interferes, gate its internal expansion off when used here — acceptable for v1 to let the panel be the detail surface; keep MatchCard's summary rows only.)

- [ ] **Step 3: Two-column layout + mobile drawer** — wrap the board `<section>`/tab content and the panel in a responsive grid. Replace the outer content container so that, on `lg:`, the board is the left column and the detail panel a sticky right column; on smaller screens the panel is a fixed bottom drawer when `selectedMatchId != null`:

```tsx
<div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-6 lg:items-start">
  <div>
    {/* existing FilterBar + board section (or CompetitionsTab) render goes here */}
  </div>

  {/* desktop panel */}
  <aside className="hidden lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden rounded-xl border border-border bg-card p-4">
    {selectedMatchId
      ? <MatchDetailPanel matchId={selectedMatchId} onClose={() => setSelectedMatchId(null)} />
      : <p className="py-12 text-center text-sm text-muted-foreground">Select a match to see details.</p>}
  </aside>
</div>

{/* mobile drawer */}
{selectedMatchId && (
  <div className="fixed inset-0 z-50 flex flex-col bg-background p-4 lg:hidden">
    <MatchDetailPanel matchId={selectedMatchId} onClose={() => setSelectedMatchId(null)} />
  </div>
)}
```

Integrate this around the existing tab/board render (the `tab === "competitions" ? … : …` block stays inside the left column). Ensure the mobile drawer locks body scroll while open (add `React.useEffect` toggling `document.body.style.overflow`).

- [ ] **Step 4: Typecheck + tests + build**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: clean; all tests pass; `/predictor` prerenders.

- [ ] **Step 5: Visual check**

With backend running (`.venv/bin/uvicorn app.main:app --reload`) and `npm run dev`: click a match → desktop right panel loads sections; crests render; narrow the window → clicking opens the bottom drawer; close works.

- [ ] **Step 6: Commit**

```bash
git add app/predictor/page.tsx
git commit -m "feat: master-detail layout with desktop panel + mobile drawer"
```

---

## Self-Review

**Spec coverage:**
- Crest image proxy → Task 1 (backend) + Task 6 (frontend wiring). ✅
- MatchDetail table + parsers → Task 2. ✅
- Detail endpoint + TTL + hybrid on-demand → Task 3. ✅
- Curated pre-pull job → Task 4. ✅
- Detail sections (lineups, timeline, stats, H2H, form) → Tasks 5 (helpers) + 7 (components). ✅
- Master-detail layout (desktop panel, mobile drawer) → Task 8. ✅
- SofaScore-like polish → folded into Tasks 6–8 (crests, compact sections). ✅
- Predictions/odds reused in panel → Task 3 payload; can be surfaced in panel later (kept as data in `MatchDetailOut`; wiring the TriBand/OddsBoard into the panel is a small follow-up, not blocking v1). Noted.

**Placeholder scan:** No TBD/TODO; code steps contain concrete code; commands have expected output. The one `_stats_dict` helper is described with its exact column mapping. ✅

**Type consistency:** `MatchDetail`, `Lineups`, `Incident`, `H2HMatch`, `TeamForm`, `FormResult` are defined once in `detail.ts` and consumed by all section components. Backend `MatchDetailOut` fields (stats/lineups/incidents/h2h/home_form/away_form/prediction/odds) match the frontend `MatchDetail` type. `is_detail_stale`, `fetch_match_detail`, `upsert_match_detail` signatures are consistent between Task 3 definition and Task 4 usage. `apiBase` is extracted to a shared module (Task 7 Step 2) before detail components import it. ✅

**Known trade-offs:** Component-level DOM tests omitted (no jsdom in repo); components verified via tsc + build + scripted visual check. Pure logic (parsers backend, helpers frontend) is fully TDD'd. Predictions/odds are carried in the detail payload but their in-panel rendering is left as a tiny follow-up to keep v1 focused on the new sections.
