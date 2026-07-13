# Match-detail panel + SofaScore detail ingestion — design

Date: 2026-07-14
Status: Approved (brainstorming) → planning

## Goal

Turn `/predictor` into a SofaScore-style **master-detail** experience: clicking a
match opens a detail panel (right column on desktop, bottom drawer on mobile)
showing **lineups, timeline, match stats, head-to-head, and both teams' recent
form**. Add the backend ingestion + endpoints to supply that detail, proxy team
crest logos through our own domain (they're currently CSP-blocked), and tighten
the board's visuals toward SofaScore's look.

Reference: sofascore.com football tab — match row → detail view with lineups,
stats, H2H, form.

## Context / current state

- Board UI (`my-portfolio/app/predictor/`) already renders a competition list
  with expandable matches, live/finished/upcoming filter, odds toggle,
  favourites. `MatchCard` shows predictions + odds.
- Backend (`football-predictor`) stores `Team.logo_url` = SofaScore image URL
  (`api.sofascore.com/.../team/{id}/image`) and a `MatchStats` table (corners,
  shots, possession, xG). `team_logo_url(id)` helper exists. The SofaScore
  client (`app/ingest/sofascore.py`, curl_cffi/Cloudflare) already calls
  `/event/{id}/odds`, `/statistics`.
- **Gaps:** no lineup/incident/H2H/form ingestion, no match-detail endpoint,
  crests fail (portfolio CSP `img-src` allows ESPN + 1xbet hosts but not
  SofaScore, so `TeamBadge` falls back to initials).
- Odds + predictions exist only for the ~30 curated leagues; detail for other
  competitions must be fetched on demand.

## Decisions (from brainstorming)

- **Fetch strategy: hybrid.** Pre-pull + store detail for curated leagues; fetch
  on-demand (and cache) for everything else on first click.
- **Sections (v1): all four** — lineups, head-to-head, team form (recent +
  next), match stats + timeline.
- **Layout:** desktop right panel (sticky, two-column master-detail); mobile
  full-screen bottom drawer.
- **Logos:** proxy + cache through our backend (`/teams/{id}/image`), not a CSP
  allow of the third-party host.
- **Lineups v1:** two-column XI + subs list (graphical pitch deferred).
- **H2H + form:** sourced from SofaScore and stored in the detail blob (uniform
  path for curated and on-demand), not recomputed from our matches table.

## Backend design (`football-predictor`)

### Team crest proxy — `GET /teams/{sofascore_id}/image`
Fetches `/team/{sofascore_id}/image` from SofaScore via the curl_cffi client,
caches bytes on disk under `data/cache/logos/{id}.png`, serves with
`Cache-Control: public, max-age=604800`. Returns 404 (or a transparent 1px) when
SofaScore has no crest. Frontend builds the URL from `team.api_team_id`.

### New table — `MatchDetail`
`match_id` (PK, FK matches.id), `lineups` JSON, `incidents` JSON, `h2h` JSON,
`home_form` JSON, `away_form` JSON, `fetched_at` (tz-aware). One blob row per
match; flexible, avoids many normalized tables. Match **stats** reuse the
existing `MatchStats` table.

JSON shapes (documented in code):
- `lineups`: `{ formationHome, formationAway, home: [{name, number, position, isStarter}], away: [...] }`
- `incidents`: `[{minute, type: "goal"|"card"|"sub", team: "home"|"away", player, detail}]`
- `h2h`: `[{date, homeName, awayName, homeGoals, awayGoals}]`
- `home_form`/`away_form`: `{recent: [{date, opp, gf, ga, result: "W"|"D"|"L"}], next: {date, opp} | null }`

### Detail endpoint — `GET /matches/{id}/detail` → `MatchDetailOut`
1. Load the match. If not found → 404.
2. Load `MatchDetail` + `MatchStats`. Compute freshness by match status:
   live → 60s, upcoming → 3600s, finished → never stale.
3. If missing/stale, call `fetch_match_detail(match)` (SofaScore:
   `/event/{id}/lineups`, `/event/{id}/incidents`, `/event/{id}/h2h`,
   `/team/{id}/events/last/0`, `/team/{id}/events/next/0`, `/statistics`), upsert
   `MatchDetail` + `MatchStats`, commit.
4. Return `MatchDetailOut` = match summary + stats + lineups + incidents + h2h +
   home_form + away_form + existing prediction + odds.

Non-blocking failures: any SofaScore sub-call that fails yields an empty
section, never a 500 (mirrors existing client behavior).

### Pre-pull job — `scripts/sofascore_detail.py`
For matches whose league is in `CURATED_TOURNAMENTS` with kickoff in
[today-2, today+7], call `fetch_match_detail` and upsert. Idempotent, commits per
match. Added as `full_board_cron.sh detail` and documented in
`FULL_BOARD_INGEST.md` for scheduling on the reachable host (daily; plus a
lighter live-detail refresh is out of scope for v1 — live games refresh
on-demand via the endpoint TTL).

### Ingestion module — `app/ingest/sofascore_detail.py`
`fetch_match_detail(client, match) -> dict` and parsers
(`parse_lineups`, `parse_incidents`, `parse_h2h`, `parse_form`). Pure parsers are
unit-tested against captured SofaScore JSON fixtures.

## Frontend design (`my-portfolio/app/predictor/`)

### Layout — master-detail
`page.tsx` gains `selectedMatchId` state. Desktop (`lg:`): a two-column grid —
board left, `MatchDetailPanel` sticky right. Mobile: `MatchDetailPanel` renders
in a full-screen bottom drawer (fixed overlay, slide-up, close button, body
scroll lock). Clicking a match row selects it; the previously inline
`MatchCard` expansion is replaced by selection driving the panel.

### `MatchDetailPanel` + subcomponents (`components/detail/`)
Fetches `GET /matches/{id}/detail` (loading + error states). Sections:
- `DetailHeader` — crests, names, score/status, kickoff, competition.
- `DetailTabs` or stacked sections (v1: stacked, in this order):
  - `Timeline` — incident list (goal/card/sub icons, minute).
  - `Lineups` — two-column XI + subs, formation labels.
  - `MatchStatsBars` — possession/shots/corners/xG as paired bars.
  - `HeadToHead` — recent meetings with scores.
  - `TeamForm` — each team's last-5 W/D/L chips + next fixture.
  - `PredictionOdds` — existing TriBand + OddsBoard (curated only), reused.
Each section renders nothing (or a muted "not available") when its data is empty.

### Logos + polish
`TeamBadge` builds `src={`${apiBase()}/teams/${team.api_team_id}/image`}`, keeps
the initials fallback on error. Tighten board rows and detail styling toward
SofaScore (compact crests, muted meta, clear section headers) using existing
tokens.

### Data types
Extend the frontend types with `MatchDetail` mirroring `MatchDetailOut`. Pure
selection/formatting helpers (form result W/D/L, incident grouping) go in
`board.ts` or a new `detail.ts`, unit-tested with vitest.

## Verification

- Backend: pytest for `fetch_match_detail` parsers (captured JSON fixtures),
  detail endpoint (TTL/staleness, 404, empty-section resilience), image proxy
  (cache hit/miss). `npm`/curl smoke against prod once deployed.
- Frontend: vitest for detail helpers; `npm run build` + `tsc --noEmit` clean;
  visual check — click a match → panel shows sections; crests load; mobile
  drawer opens/closes.

## Out of scope (v1)
Graphical pitch lineup view, player profile pages, full league standings,
live text commentary, historical stat charts, live-detail push over WebSocket
(detail refreshes via endpoint TTL on re-open).

## Risks
- **SofaScore endpoint shapes** vary by match (pre-match has no lineups/stats);
  parsers must tolerate missing keys and return empty sections.
- **On-demand latency** for non-curated matches (first click triggers a live
  SofaScore fetch); acceptable with a loading state, and cached after.
- **Image proxy load** — cache on disk to avoid re-fetching crests every request.
- **Deploy-host reachability** — the detail pre-pull job shares the Cloudflare/
  datacenter-IP constraint (runs on the reachable host, like broad/live).
