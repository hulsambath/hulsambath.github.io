# SofaScore-style football board — design

Date: 2026-07-13
Status: Approved (brainstorming) → planning

## Goal

Rebuild the portfolio's `/predictor` page into a SofaScore-style football board:
a collapsed **list of competitions** for a selected day, each row showing a
flag, competition name, country, and a **match-count badge**, expandable to
reveal that competition's matches (with the existing prediction + odds detail).
Add **Live / Finished / Upcoming** filtering, an **Odds** toggle, and a
**Favourites** tab. The board must show the *full* SofaScore breadth
(friendlies, lower divisions, youth, women, cups), not just curated leagues.

Reference: the SofaScore "Football today" tab (competition list with counts,
Live/Finished/Upcoming chips, date navigator, Odds toggle).

## Context / current state

- **Backend** (`football-predictor/`, FastAPI + Postgres) already ingests the
  full SofaScore board. `app/ingest/sofascore.py` `broad_pull` sweeps all ~297
  football categories via `parse_all_events` (no whitelist) — verified reachable
  from a local machine: 297 categories, 35 live matches across 21 tournaments
  including exotic competitions. API-Football / ESPN / 1xbet are fallbacks;
  sources are de-duplicated by `_SOURCE_RANK` (sofascore wins).
- Endpoints already serve what the UI needs, with **no source/whitelist filter**
  in the day query:
  - `GET /leagues` → `LeagueOut { id, api_league_id, name, country }`
  - `GET /matches/dates` → `DateBucketOut[]` (date + count)
  - `GET /matches/by-date?date=YYYY-MM-DD` → `UpcomingMatchOut[]`
    (`MatchOut` + `prediction: PredictionOut|null` + `odds: OddsOut|null`;
    `MatchOut` includes `league_id, round, kickoff_utc, status, home_team,
    away_team, home_goals, away_goals`).
  - `WS /ws/matches` → live push updates.
- **Frontend** (`my-portfolio/app/predictor/page.tsx`) already fetches these,
  groups by league, renders `MatchCard`s with predictions/odds, has a date strip
  and live WebSocket. It does **not** yet have the collapsed competition-list
  layout, status filter, odds toggle, or favourites.
- **The gap:** in production only `espn_sync` (curated competitions) is
  scheduled; `sofascore_broad` is defined in the Procfile but not scheduled,
  because SofaScore's Cloudflare blocks the deploy host's datacenter IP. So the
  prod DB is missing most tournaments.

## Thread A — Data: run the broad + live jobs from a reachable host (ops)

No scraper code changes. The scraper already produces the full board; it must
run somewhere SofaScore is reachable, writing to the **production Postgres**.

- Schedule on a reachable host (developer's Mac via `cron`/`launchd`, or a small
  always-on VPS) with `DATABASE_URL` pointed at production Postgres:
  - `scripts/sofascore_broad.py` — **daily** (−1/+3 day full board, all categories).
  - `scripts/sofascore_live.py` — **every few minutes** (fresh live scores/statuses).
- **Verification:** run `sofascore_broad` once manually against the prod DB, then
  confirm `GET /matches/by-date?date=<today>` returns exotic competitions, not
  just curated ones.
- **Trade-off (documented, not decided here):** a laptop-hosted cron is skipped
  when the machine is off; a VPS is the robust option. Host choice and the prod
  `DATABASE_URL` are provided by the developer — the plan sets up the cron/launchd
  scaffolding and a verification checklist, and can validate the pull against a
  local DB without prod credentials.

## Thread B — UI: SofaScore-style board (`my-portfolio/app/predictor/`)

Refactor the monolithic `page.tsx` into focused units. Keep existing data
fetching, helpers (`isLive`/`isFinished`/`isoDay`/`timeLabel`/`outcomeProbs`),
the date-strip logic, and the WebSocket. Reuse the existing `MatchCard` for the
expanded match detail.

### Components / units

- `page.tsx` — data + state owner. Existing fetches (`/leagues`,
  `/matches/dates`, `/matches/by-date`, WS). New state: `statusFilter`
  (`"live" | "finished" | "upcoming"`), `oddsShown: boolean`, `activeTab`
  (`"all" | "favourites" | "competitions"`), plus favourites via the hook below.
- `components/BoardHeader.tsx` — the three tabs (All / Favourites / Competitions)
  and the `‹ Today ›` date navigator (reuses existing DateStrip logic).
- `components/FilterBar.tsx` — Live(n) / Finished / Upcoming chips (counts derive
  from the day's matches under the current tab) + an Odds toggle switch.
- `components/CompetitionRow.tsx` — one collapsed competition row: country flag,
  competition name, country, match-count badge, favourite star, chevron.
  Expands to render that competition's matches (existing `MatchCard`), gated by
  `oddsShown` for the odds block.
- `components/CountryFlag.tsx` — maps a `country` string to an emoji flag, with an
  initials fallback for unknown/region names ("World", "International"). Fully
  self-contained; no external image requests.
- `hooks/useFavourites.ts` — `localStorage`-backed `Set<number>` of favourited
  `league_id`s, with `isFavourite` / `toggle`. Namespaced key so it survives
  reloads and doesn't collide with other portfolio state.

### Behavior

- **Grouping/counts:** group the day's `by-date` matches by `league_id`; join
  each group to its `LeagueOut` (name, country) via `/leagues`. Apply the active
  `statusFilter`; a competition row renders only if it has ≥1 match in that
  filter; the badge shows that count. Where a mixed "live/total" is meaningful
  (e.g. friendlies umbrella), show `live/total` like the screenshot's `3/21`.
- **Status classification:** reuse `isLive`/`isFinished`. Upcoming = not started
  (`NS` and other pre-kickoff statuses). A single source of truth for these sets.
- **Sorting:** favourited competitions pinned to the top, then alphabetical by
  `country` then `name`.
- **Tabs:**
  - *All* — full board for the day + filter.
  - *Favourites* — only favourited competitions (from the hook).
  - *Competitions* — a searchable A–Z list built from `/leagues`; selecting one
    filters the board to that competition (sets a `leagueId` filter and returns
    to the board view).
- **Odds toggle:** shows/hides the bookmaker odds block on expanded match rows.
- **Live updates:** existing WebSocket updates scores/statuses in place; counts
  and Live chip recompute from the updated match list.

### Styling

Follow the existing predictor design tokens (`app/predictor/predictor.css` +
Tailwind: `--live`, `border`, `card`, `secondary`, dark theme) so the board is
cohesive with the rest of the portfolio. Match the existing card radii, spacing,
and `font-data` numeric styling.

### Verification

- `npm run build` and `npm run lint` clean.
- Visual check against a running backend (local mock mode works offline; or the
  prod API once Thread A has populated the board): competition list renders with
  counts, Live/Finished/Upcoming switches the set, Odds toggle shows/hides odds,
  Favourites persists across reload, expanding a competition shows matches with
  prediction + odds detail.

## Out of scope (YAGNI)

- football-data.org (or any additional data provider) integration.
- Routing the scraper through a proxy so the current deploy host can reach
  SofaScore (revisit only if a laptop/VPS host proves impractical).
- Competition logos (flags + initials only; league records store no logo URL).
- Per-match favourites (competition-level only for v1).
- Drag-to-reorder competitions.

## Risks / things to watch

- **`/leagues` country coverage:** flags depend on the `country` string; unknown
  or region-style values must degrade to an initials chip, never a broken flag.
- **Status code coverage:** the Live filter depends on statuses the backend
  actually emits from SofaScore ingest; confirm the `isLive`/`upcoming` sets
  cover them (e.g. `HT`, `NS`, postponed) so counts are correct.
- **Laptop-host availability (Thread A):** documented trade-off; VPS is the
  robust path.
