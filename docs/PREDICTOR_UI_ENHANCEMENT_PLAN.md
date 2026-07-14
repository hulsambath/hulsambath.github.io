# Predictor UI Enhancement Plan

Created 2026-07-15. Goal: make `/predictor` feel closer to SofaScore for live match clarity and closer to 1xBet for dense odds scanning, while keeping this product clearly prediction-first.

## Product Direction

Use SofaScore patterns for fixture hierarchy: sport/date/status navigation, competition sections, live score states, match detail pages, incidents, form, H2H, and stats. Use 1xBet patterns only where odds need compact comparison: fixed market columns, clear 1/X/2 labels, over/under cells, and quick market scanning. Do not copy either brand, palette, or betting flow.

Current limitation: production has no visible odds or predictions after mock cleanup. The UI can be improved now, but the final experience depends on restoring real prediction and odds coverage in `football-predictor`.

## Phase 1 - Match Board Scanability

- Replace card-first match rows with a denser league table layout on desktop:
  `time/status | home | score/xG | away | model 1/X/2 | odds 1/X/2 | O/U 2.5 | actions`.
- Keep mobile as stacked match rows, but reduce vertical padding and show the most important values above the fold: status, teams, score/kickoff, top model pick, and best available odds.
- Add a sticky market header when odds are enabled so 1/X/2 and O/U columns remain obvious.
- Show data availability badges: `Predicted`, `Odds`, `Stats`, `Lineups`, or `Pending`, so empty states are understandable.
- Auto-expand live competitions and competitions with favorites; keep others collapsible.

## Phase 2 - Clear Prediction Meaning

- Add a prominent "Model edge" strip per match:
  `Model pick`, `confidence`, `market implied`, and `edge` when odds exist.
- Rename vague labels:
  `model` -> `Model probability`; `market implied` -> `Odds implied probability`.
- Show top scorelines as compact chips in the row hover/expanded area, not only inside full details.
- Use consistent color semantics: home, draw, away, live, positive edge, warning/missing data.
- Add helper text only in empty states and tooltips, not as large instructional blocks.

## Phase 3 - SofaScore-Style Detail View

- Rework the detail panel into tabs: `Summary`, `Stats`, `Odds`, `Lineups`, `H2H`.
- Summary should show team crests, score/kickoff, status, model pick, top scorelines, and key incidents.
- Stats should emphasize side-by-side bars for possession, shots, shots on target, corners, and xG.
- Odds should show latest bookmaker, captured time, 1/X/2, O/U 2.5, BTTS if backend exposes it, plus model-vs-market comparison.
- H2H and form should be visually compact: result chips, opponent, score, date.

## Phase 4 - Navigation and Filters

- Add a left rail or compact filter drawer for country/competition filtering on desktop.
- Add quick filters: `Live`, `Top leagues`, `Favorites`, `With predictions`, `With odds`, `Kickoff soon`.
- Improve date strip with counts by status: live/upcoming/finished, not just total.
- Preserve user preferences in local storage: odds visibility, selected filters, favorite competitions, compact mode.

## Phase 5 - Trust, Freshness, and Empty States

- Display "Last updated" from the latest match or WebSocket refresh time.
- Show source/freshness details in small text: `SofaScore`, `1xBet`, `API-Football fallback`, or `ESPN fallback` when backend exposes source safely.
- Replace generic empty messages with operational states:
  `No live matches`, `Predictions pending`, `Odds unavailable`, `Backend offline`, `Feed stale`.
- Add a non-blocking banner if the board has zero predictions or zero odds for the selected day.

## Backend/API Needs

- Restore prediction coverage and real odds ingestion first; otherwise the enhanced UI will mostly display pending states.
- Add match `source`, odds `captured_at`, and prediction `created_at` to board responses if safe.
- Add optional detail fields for `btts_yes`, `btts_no`, bookmaker list, and market timestamp.
- Batch-load odds and predictions in `/matches/by-date` before the UI increases visible rows.

## Implementation Order

1. Refactor `MatchCard` into `MatchRow` plus `MatchCardMobile`.
2. Add board-level display modes: `compact`, `comfortable`, and `odds`.
3. Add market header and model/odds comparison utilities with tests.
4. Rework detail panel into tabs using existing detail components.
5. Add empty-state/freshness components.
6. Validate with `npm test`, `npm run lint`, `npm run build`, and Playwright/manual screenshots for mobile and desktop.

## Acceptance Criteria

- A user can scan a full matchday without opening every card.
- For each match, it is obvious whether the displayed numbers are model probabilities, bookmaker odds, or live scores.
- Missing predictions or odds are visibly explained, not silently blank.
- Desktop behaves like a data board; mobile behaves like a compact live-score app.
- The visual language is inspired by SofaScore/1xBet information structure, not their branding.
