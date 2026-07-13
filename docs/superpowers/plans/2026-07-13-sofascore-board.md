# SofaScore-style Football Board — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `my-portfolio/app/predictor` into a SofaScore-style board — a collapsed, expandable competition list per day with match-count badges, Live/Finished/Upcoming filtering, an Odds toggle, and a Favourites tab — backed by the full SofaScore board the backend already scrapes.

**Architecture:** Extract the board's pure logic (status classification, competition grouping + counts, filter/sort, country→flag) into a tested `app/predictor/board.ts` module. Build presentational React components (`CountryFlag`, `CompetitionRow`, `FilterBar`, `BoardHeader`, `CompetitionsTab`) that consume it, and rewire `page.tsx` as the data/state owner. Reuse the existing `MatchCard`, helpers, `DateStrip`, and WebSocket unchanged. Separately (Thread A), schedule the existing `sofascore_broad`/`sofascore_live` scripts from a reachable host so production has full-board data.

**Tech Stack:** Next.js 16 (App Router, `"use client"`), React 19, TypeScript, Tailwind CSS, lucide-react icons. Vitest (added) for pure-logic unit tests. Backend: FastAPI + Postgres (no code changes; ops/scheduling only).

## Global Constraints

- Target directory for all frontend work: `my-portfolio/`. Never touch other workspace projects.
- Match existing predictor design tokens/idioms: Tailwind classes with `--live`, `border`, `card`, `secondary`, `muted-foreground`, `font-display`, `font-data`; dark theme. Reuse the `chip()` class pattern already in `page.tsx`.
- Reuse existing exported helpers/components from `page.tsx` — do not duplicate `isLive`, `isFinished`, `isoDay`, `timeLabel`, `outcomeProbs`, `apiBase`, `MatchCard`, `DateStrip`. Move shared ones into `board.ts` where a task requires importing them from a component file.
- API contract is fixed (no backend changes in Thread B): `GET /leagues` → `{id, api_league_id, name, country}[]`; `GET /matches/by-date?date=YYYY-MM-DD` → matches with `league_id, status, kickoff_utc, home_team, away_team, home_goals, away_goals, prediction, odds`; `GET /matches/dates` → `{date, count}[]`; `WS /ws/matches`.
- Status sets (single source of truth in `board.ts`): `FINISHED = {FT, AET, PEN}`; `NOT_LIVE = {NS, PST, CANC, FT, AET, PEN}`; live = not in NOT_LIVE; upcoming = `NS`/other pre-kickoff not-started; finished = in FINISHED.
- Verification per task: `npm run lint` clean and (for logic) `npx vitest run` green; final task also `npm run build` clean.
- Favourites are competition-level (`league_id`) only, persisted in `localStorage` under key `predictor:favourites`.

---

### Task 1: Add Vitest + extract types and status classification into `board.ts`

**Files:**
- Create: `app/predictor/board.ts`
- Create: `app/predictor/board.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (add `test` script + devDeps)

**Interfaces:**
- Produces: `type StatusFilter = "live" | "finished" | "upcoming"`; `FINISHED: Set<string>`, `NOT_LIVE: Set<string>`; `isFinished(s: string): boolean`; `isLive(s: string): boolean`; `classify(status: string): StatusFilter`.

- [ ] **Step 1: Install Vitest**

```bash
cd my-portfolio && npm install -D vitest@^3
```

- [ ] **Step 2: Add test script to package.json**

In `package.json` `"scripts"`, add:

```json
"test": "vitest run"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["app/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Write the failing test** — `app/predictor/board.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { classify, isFinished, isLive } from "./board";

describe("status classification", () => {
  it("treats FT/AET/PEN as finished", () => {
    expect(isFinished("FT")).toBe(true);
    expect(classify("AET")).toBe("finished");
  });
  it("treats NS/PST/CANC as upcoming (not live)", () => {
    expect(isLive("NS")).toBe(false);
    expect(classify("NS")).toBe("upcoming");
    expect(classify("PST")).toBe("upcoming");
  });
  it("treats in-progress codes as live", () => {
    expect(isLive("1H")).toBe(true);
    expect(classify("HT")).toBe("live");
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npx vitest run app/predictor/board.test.ts`
Expected: FAIL — `Cannot find module './board'`.

- [ ] **Step 6: Write minimal implementation** — `app/predictor/board.ts`

```ts
export type StatusFilter = "live" | "finished" | "upcoming";

export const FINISHED = new Set(["FT", "AET", "PEN"]);
export const NOT_LIVE = new Set(["NS", "PST", "CANC", "FT", "AET", "PEN"]);

export const isFinished = (s: string): boolean => FINISHED.has(s);
export const isLive = (s: string): boolean => !NOT_LIVE.has(s);

export function classify(status: string): StatusFilter {
  if (isLive(status)) return "live";
  if (isFinished(status)) return "finished";
  return "upcoming";
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run app/predictor/board.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts app/predictor/board.ts app/predictor/board.test.ts
git commit -m "test: add vitest + board status classification"
```

---

### Task 2: Country → flag emoji mapping

**Files:**
- Modify: `app/predictor/board.ts`
- Modify: `app/predictor/board.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `countryFlag(country: string | null | undefined): string | null` — returns an emoji flag for a known country name, else `null` (caller shows initials).

- [ ] **Step 1: Write the failing test** — append to `board.test.ts`

```ts
import { countryFlag } from "./board";

describe("countryFlag", () => {
  it("maps known countries to emoji flags", () => {
    expect(countryFlag("England")).toBe("🏴󠁧󠁢󠁥󠁮󠁧󠁿");
    expect(countryFlag("Brazil")).toBe("🇧🇷");
    expect(countryFlag("Argentina")).toBe("🇦🇷");
  });
  it("returns null for unknown / region names", () => {
    expect(countryFlag("World")).toBeNull();
    expect(countryFlag(null)).toBeNull();
    expect(countryFlag("International")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/predictor/board.test.ts`
Expected: FAIL — `countryFlag is not a function`.

- [ ] **Step 3: Write minimal implementation** — append to `board.ts`

```ts
// Regional-indicator flag from a 2-letter ISO code.
function iso2ToFlag(code: string): string {
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt(0)));
}

// Country display name (as SofaScore/backend emits) → ISO2, plus a few
// custom-flag exceptions. Extend as new countries appear in /leagues.
const COUNTRY_ISO2: Record<string, string> = {
  Spain: "ES", Italy: "IT", Germany: "DE", France: "FR", Portugal: "PT",
  Netherlands: "NL", Belgium: "BE", Brazil: "BR", Argentina: "AR",
  Bolivia: "BO", Ecuador: "EC", Norway: "NO", USA: "US", Cameroon: "CM",
  Colombia: "CO", Mexico: "MX", Chile: "CL", Uruguay: "UY", Peru: "PE",
  Japan: "JP", "South Korea": "KR", Australia: "AU", Turkey: "TR",
  Scotland: "GB-SCT", Wales: "GB-WLS",
};

const CUSTOM_FLAGS: Record<string, string> = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

// Region/umbrella labels that have no national flag.
const NO_FLAG = new Set(["World", "International", "Europe", "Club", ""]);

export function countryFlag(country: string | null | undefined): string | null {
  if (!country || NO_FLAG.has(country)) return null;
  if (CUSTOM_FLAGS[country]) return CUSTOM_FLAGS[country];
  const iso = COUNTRY_ISO2[country];
  if (!iso || iso.includes("-")) return null; // subdivisions handled by CUSTOM_FLAGS
  return iso2ToFlag(iso);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/predictor/board.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/predictor/board.ts app/predictor/board.test.ts
git commit -m "feat: country-to-flag emoji mapping"
```

---

### Task 3: Competition grouping + per-status counts

**Files:**
- Modify: `app/predictor/board.ts`
- Modify: `app/predictor/board.test.ts`

**Interfaces:**
- Consumes: `classify`, `StatusFilter`.
- Produces:
  - `type BoardLeague = { id: number; name: string; country: string | null }`
  - `type BoardMatch = { id: number; league_id: number; status: string }` (structural subset of the page's `Match`)
  - `type CompetitionGroup = { league: BoardLeague; matches: T[]; counts: { live: number; finished: number; upcoming: number; total: number } }` — generic over the match type via `groupByCompetition<T extends BoardMatch>(...)`.
  - `groupByCompetition<T extends BoardMatch>(matches: T[], leaguesById: Map<number, BoardLeague>): CompetitionGroup<T>[]`

- [ ] **Step 1: Write the failing test** — append to `board.test.ts`

```ts
import { groupByCompetition } from "./board";

const leagues = new Map([
  [1, { id: 1, name: "Premier League", country: "England" }],
  [2, { id: 2, name: "Serie B", country: "Brazil" }],
]);

describe("groupByCompetition", () => {
  it("groups matches by league with per-status counts", () => {
    const matches = [
      { id: 10, league_id: 1, status: "1H" },
      { id: 11, league_id: 1, status: "FT" },
      { id: 12, league_id: 2, status: "NS" },
    ];
    const groups = groupByCompetition(matches, leagues);
    const pl = groups.find((g) => g.league.id === 1)!;
    expect(pl.matches).toHaveLength(2);
    expect(pl.counts).toEqual({ live: 1, finished: 1, upcoming: 0, total: 2 });
    const b = groups.find((g) => g.league.id === 2)!;
    expect(b.counts).toEqual({ live: 0, finished: 0, upcoming: 1, total: 1 });
  });
  it("synthesizes a placeholder league when id is unknown", () => {
    const groups = groupByCompetition([{ id: 9, league_id: 99, status: "NS" }], leagues);
    expect(groups[0].league.name).toBe("League 99");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/predictor/board.test.ts`
Expected: FAIL — `groupByCompetition is not a function`.

- [ ] **Step 3: Write minimal implementation** — append to `board.ts`

```ts
export type BoardLeague = { id: number; name: string; country: string | null };
export type BoardMatch = { id: number; league_id: number; status: string };

export type CompetitionGroup<T extends BoardMatch> = {
  league: BoardLeague;
  matches: T[];
  counts: { live: number; finished: number; upcoming: number; total: number };
};

export function groupByCompetition<T extends BoardMatch>(
  matches: T[],
  leaguesById: Map<number, BoardLeague>,
): CompetitionGroup<T>[] {
  const groups = new Map<number, CompetitionGroup<T>>();
  for (const m of matches) {
    let g = groups.get(m.league_id);
    if (!g) {
      const league = leaguesById.get(m.league_id) ??
        { id: m.league_id, name: `League ${m.league_id}`, country: null };
      g = { league, matches: [], counts: { live: 0, finished: 0, upcoming: 0, total: 0 } };
      groups.set(m.league_id, g);
    }
    g.matches.push(m);
    g.counts.total += 1;
    g.counts[classify(m.status)] += 1;
  }
  return [...groups.values()];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/predictor/board.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/predictor/board.ts app/predictor/board.test.ts
git commit -m "feat: group matches by competition with per-status counts"
```

---

### Task 4: Filter + sort competitions for the active view

**Files:**
- Modify: `app/predictor/board.ts`
- Modify: `app/predictor/board.test.ts`

**Interfaces:**
- Consumes: `CompetitionGroup`, `StatusFilter`, `BoardMatch`.
- Produces: `visibleCompetitions<T extends BoardMatch>(groups: CompetitionGroup<T>[], opts: { status: StatusFilter; favourites: Set<number>; onlyFavourites: boolean; leagueId?: number | null }): CompetitionGroup<T>[]` — keeps groups with ≥1 match in `status`, optionally restricted to favourites or a single league; sorts favourites first, then by country then name.

- [ ] **Step 1: Write the failing test** — append to `board.test.ts`

```ts
import { visibleCompetitions } from "./board";

const g = (id: number, name: string, country: string, live: number, up: number) => ({
  league: { id, name, country },
  matches: [] as { id: number; league_id: number; status: string }[],
  counts: { live, finished: 0, upcoming: up, total: live + up },
});

describe("visibleCompetitions", () => {
  const groups = [
    g(1, "Premier League", "England", 0, 2),
    g(2, "Serie B", "Brazil", 3, 0),
    g(3, "Copa", "Argentina", 0, 0),
  ];
  it("keeps only competitions with matches in the active status", () => {
    const live = visibleCompetitions(groups, { status: "live", favourites: new Set(), onlyFavourites: false });
    expect(live.map((x) => x.league.id)).toEqual([2]);
  });
  it("pins favourites first, then sorts by country then name", () => {
    const up = visibleCompetitions(groups, { status: "upcoming", favourites: new Set([1]), onlyFavourites: false });
    expect(up.map((x) => x.league.id)).toEqual([1]); // only PL has upcoming; favourite pinned
  });
  it("restricts to favourites when onlyFavourites", () => {
    const favs = visibleCompetitions(groups, { status: "live", favourites: new Set([1]), onlyFavourites: true });
    expect(favs).toHaveLength(0); // league 1 has no live matches
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/predictor/board.test.ts`
Expected: FAIL — `visibleCompetitions is not a function`.

- [ ] **Step 3: Write minimal implementation** — append to `board.ts`

```ts
export function visibleCompetitions<T extends BoardMatch>(
  groups: CompetitionGroup<T>[],
  opts: { status: StatusFilter; favourites: Set<number>; onlyFavourites: boolean; leagueId?: number | null },
): CompetitionGroup<T>[] {
  const { status, favourites, onlyFavourites, leagueId } = opts;
  return groups
    .filter((g) => g.counts[status] > 0)
    .filter((g) => (leagueId == null ? true : g.league.id === leagueId))
    .filter((g) => (onlyFavourites ? favourites.has(g.league.id) : true))
    .sort((a, b) => {
      const fa = favourites.has(a.league.id) ? 0 : 1;
      const fb = favourites.has(b.league.id) ? 0 : 1;
      if (fa !== fb) return fa - fb;
      const ca = a.league.country ?? "";
      const cb = b.league.country ?? "";
      return ca.localeCompare(cb) || a.league.name.localeCompare(b.league.name);
    });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/predictor/board.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/predictor/board.ts app/predictor/board.test.ts
git commit -m "feat: filter and sort competitions for the active view"
```

---

### Task 5: `useFavourites` hook (localStorage-backed)

**Files:**
- Create: `app/predictor/useFavourites.ts`
- Modify: `app/predictor/board.ts` (add pure storage helpers)
- Modify: `app/predictor/board.test.ts`

**Interfaces:**
- Produces (pure, in `board.ts`): `FAVOURITES_KEY = "predictor:favourites"`; `parseFavourites(raw: string | null): Set<number>`; `serializeFavourites(s: Set<number>): string`.
- Produces (hook, in `useFavourites.ts`): `useFavourites(): { favourites: Set<number>; isFavourite(id: number): boolean; toggle(id: number): void }`.

- [ ] **Step 1: Write the failing test** — append to `board.test.ts`

```ts
import { parseFavourites, serializeFavourites } from "./board";

describe("favourites storage", () => {
  it("parses a JSON array of ids, tolerating garbage", () => {
    expect([...parseFavourites("[1,2,3]")]).toEqual([1, 2, 3]);
    expect([...parseFavourites(null)]).toEqual([]);
    expect([...parseFavourites("not json")]).toEqual([]);
    expect([...parseFavourites('["x", 4]')]).toEqual([4]);
  });
  it("round-trips through serialize", () => {
    expect([...parseFavourites(serializeFavourites(new Set([5, 6])))]).toEqual([5, 6]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/predictor/board.test.ts`
Expected: FAIL — `parseFavourites is not a function`.

- [ ] **Step 3: Write pure helpers** — append to `board.ts`

```ts
export const FAVOURITES_KEY = "predictor:favourites";

export function parseFavourites(raw: string | null): Set<number> {
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((n): n is number => typeof n === "number"));
  } catch {
    return new Set();
  }
}

export function serializeFavourites(s: Set<number>): string {
  return JSON.stringify([...s]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/predictor/board.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the hook** — `app/predictor/useFavourites.ts`

```ts
"use client";

import * as React from "react";
import { FAVOURITES_KEY, parseFavourites, serializeFavourites } from "./board";

export function useFavourites() {
  const [favourites, setFavourites] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    setFavourites(parseFavourites(localStorage.getItem(FAVOURITES_KEY)));
  }, []);

  const persist = React.useCallback((next: Set<number>) => {
    setFavourites(next);
    try { localStorage.setItem(FAVOURITES_KEY, serializeFavourites(next)); } catch { /* ignore */ }
  }, []);

  const toggle = React.useCallback((id: number) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem(FAVOURITES_KEY, serializeFavourites(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const isFavourite = React.useCallback((id: number) => favourites.has(id), [favourites]);
  return { favourites, isFavourite, toggle, persist };
}
```

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: clean (no errors in the new files).

- [ ] **Step 7: Commit**

```bash
git add app/predictor/board.ts app/predictor/board.test.ts app/predictor/useFavourites.ts
git commit -m "feat: useFavourites hook with localStorage persistence"
```

---

### Task 6: `CountryFlag` component

**Files:**
- Create: `app/predictor/components/CountryFlag.tsx`

**Interfaces:**
- Consumes: `countryFlag` from `board.ts`.
- Produces: `<CountryFlag country={string | null} name={string} />` — renders the emoji flag, or a 2-letter initials chip fallback derived from `name`.

- [ ] **Step 1: Write the component**

```tsx
import { countryFlag } from "../board";

export function CountryFlag({ country, name }: { country: string | null; name: string }) {
  const flag = countryFlag(country);
  if (flag) return <span aria-hidden className="text-lg leading-none">{flag}</span>;
  const initials = name.replace(/[^A-Za-z ]/g, "").split(" ")
    .filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  return (
    <span aria-hidden
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-secondary font-display text-[9px] font-bold text-muted-foreground">
      {initials || "?"}
    </span>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/predictor/components/CountryFlag.tsx
git commit -m "feat: CountryFlag component with initials fallback"
```

---

### Task 7: `CompetitionRow` component (collapsed + expandable)

**Files:**
- Create: `app/predictor/components/CompetitionRow.tsx`

**Interfaces:**
- Consumes: `CompetitionGroup`, `StatusFilter` from `board.ts`; `CountryFlag`; the page's `Match`, `League`, and `MatchCard` (exported from `page.tsx` in Task 11 — see note). Until Task 11 exports them, this component imports `MatchCard`/types from `page.tsx`.
- Produces: `<CompetitionRow group={...} status={...} oddsShown={boolean} isFavourite={boolean} onToggleFavourite={() => void} renderMatch={(m) => ReactNode} />`.

**Note:** to avoid a circular import, `CompetitionRow` does not import `MatchCard` directly; the page passes a `renderMatch` callback. The count badge shows `live/total` when live>0 and there are also non-live matches, else the plain count for the active status.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { ChevronDown, Star } from "lucide-react";
import * as React from "react";
import type { BoardMatch, CompetitionGroup, StatusFilter } from "../board";
import { CountryFlag } from "./CountryFlag";

function badge(counts: CompetitionGroup<BoardMatch>["counts"], status: StatusFilter): string {
  if (status === "live" && counts.live > 0 && counts.total > counts.live)
    return `${counts.live}/${counts.total}`;
  return String(counts[status]);
}

export function CompetitionRow<T extends BoardMatch>({
  group, status, isFavourite, onToggleFavourite, renderMatch,
}: {
  group: CompetitionGroup<T>;
  status: StatusFilter;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  renderMatch: (m: T) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const shown = group.matches.filter((m) => {
    if (status === "live") return group.counts.live > 0;
    return true;
  });
  return (
    <div className="mb-2 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button aria-label={isFavourite ? "Unfavourite" : "Favourite"}
          onClick={onToggleFavourite}
          className="shrink-0 text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
          <Star className={`h-4 w-4 ${isFavourite ? "fill-[hsl(var(--live))] text-[hsl(var(--live))]" : ""}`} />
        </button>
        <button onClick={() => setOpen(!open)} aria-expanded={open}
          className="flex flex-1 items-center gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
          <CountryFlag country={group.league.country} name={group.league.name} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-sm font-semibold uppercase tracking-wide">{group.league.name}</span>
            {group.league.country && (
              <span className="block truncate text-[11px] text-muted-foreground/70">{group.league.country}</span>
            )}
          </span>
          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 font-data text-xs font-semibold text-muted-foreground">
            {badge(group.counts, status)}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="space-y-2 border-t border-border bg-background/40 p-2.5">
          {shown.map((m) => renderMatch(m))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/predictor/components/CompetitionRow.tsx
git commit -m "feat: collapsible CompetitionRow with count badge and favourite star"
```

---

### Task 8: `FilterBar` component (status chips + odds toggle)

**Files:**
- Create: `app/predictor/components/FilterBar.tsx`

**Interfaces:**
- Consumes: `StatusFilter` from `board.ts`.
- Produces: `<FilterBar status={StatusFilter} onStatus={(s) => void} liveCount={number} oddsShown={boolean} onOddsToggle={() => void} />`.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import type { StatusFilter } from "../board";

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "live", label: "Live" },
  { key: "finished", label: "Finished" },
  { key: "upcoming", label: "Upcoming" },
];

export function FilterBar({
  status, onStatus, liveCount, oddsShown, onOddsToggle,
}: {
  status: StatusFilter;
  onStatus: (s: StatusFilter) => void;
  liveCount: number;
  oddsShown: boolean;
  onOddsToggle: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = status === t.key;
          const isLive = t.key === "live";
          return (
            <button key={t.key} onClick={() => onStatus(t.key)} aria-pressed={active}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-sm font-semibold uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${
                active
                  ? isLive
                    ? "border-[hsl(var(--live))] bg-[hsl(var(--live)/0.14)] text-[hsl(var(--live))]"
                    : "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"}`}>
              {isLive && <span className="live-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "hsl(var(--live))" }} />}
              {t.label}{isLive && liveCount > 0 ? ` (${liveCount})` : ""}
            </button>
          );
        })}
      </div>
      <button onClick={onOddsToggle} aria-pressed={oddsShown}
        className="flex shrink-0 items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Odds
        <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${oddsShown ? "bg-foreground" : "bg-muted"}`}>
          <span className={`inline-block h-4 w-4 rounded-full bg-background transition-transform ${oddsShown ? "translate-x-4" : "translate-x-0.5"}`} />
        </span>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/predictor/components/FilterBar.tsx
git commit -m "feat: FilterBar with Live/Finished/Upcoming chips and Odds toggle"
```

---

### Task 9: `BoardHeader` component (tabs + date navigator)

**Files:**
- Create: `app/predictor/components/BoardHeader.tsx`

**Interfaces:**
- Produces: `type BoardTab = "all" | "favourites" | "competitions"`; `<BoardHeader tab={BoardTab} onTab={(t) => void} favouriteCount={number}>{children}</BoardHeader>` — renders the three tabs; `children` is the existing `DateStrip` element placed on the right.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import * as React from "react";

export type BoardTab = "all" | "favourites" | "competitions";

const TABS: { key: BoardTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "favourites", label: "Favourites" },
  { key: "competitions", label: "Competitions" },
];

export function BoardHeader({
  tab, onTab, favouriteCount, children,
}: {
  tab: BoardTab;
  onTab: (t: BoardTab) => void;
  favouriteCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <nav className="flex gap-4" aria-label="Board view">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => onTab(t.key)} aria-pressed={active}
                className={`relative pb-1 font-display text-lg font-bold uppercase tracking-wide transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t.label}
                {t.key === "favourites" && favouriteCount > 0 ? ` (${favouriteCount})` : ""}
                {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />}
              </button>
            );
          })}
        </nav>
      </div>
      <div>{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/predictor/components/BoardHeader.tsx
git commit -m "feat: BoardHeader with All/Favourites/Competitions tabs"
```

---

### Task 10: `CompetitionsTab` component (searchable A–Z league list)

**Files:**
- Create: `app/predictor/components/CompetitionsTab.tsx`

**Interfaces:**
- Consumes: `BoardLeague` from `board.ts`; `CountryFlag`.
- Produces: `<CompetitionsTab leagues={BoardLeague[]} onPick={(id: number) => void} />` — text search filters the list; picking a league calls `onPick` (page then switches to All view filtered to that league).

- [ ] **Step 1: Write the component**

```tsx
"use client";

import * as React from "react";
import type { BoardLeague } from "../board";
import { CountryFlag } from "./CountryFlag";

export function CompetitionsTab({
  leagues, onPick,
}: {
  leagues: BoardLeague[];
  onPick: (id: number) => void;
}) {
  const [q, setQ] = React.useState("");
  const needle = q.trim().toLowerCase();
  const filtered = leagues
    .filter((l) =>
      !needle ||
      l.name.toLowerCase().includes(needle) ||
      (l.country ?? "").toLowerCase().includes(needle))
    .sort((a, b) =>
      (a.country ?? "").localeCompare(b.country ?? "") || a.name.localeCompare(b.name));

  return (
    <div>
      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search competitions…"
        className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 font-data text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      />
      <ul className="space-y-1">
        {filtered.map((l) => (
          <li key={l.id}>
            <button onClick={() => onPick(l.id)}
              className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left hover:border-border hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
              <CountryFlag country={l.country} name={l.name} />
              <span className="min-w-0 flex-1 truncate font-display text-sm font-semibold">{l.name}</span>
              {l.country && <span className="shrink-0 text-[11px] text-muted-foreground/70">{l.country}</span>}
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">No competitions match “{q}”.</li>
        )}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/predictor/components/CompetitionsTab.tsx
git commit -m "feat: searchable Competitions tab"
```

---

### Task 11: Rewire `page.tsx` into the board + thread `oddsShown` into `MatchCard`

**Files:**
- Modify: `app/predictor/page.tsx`

**Interfaces:**
- Consumes: everything above (`board.ts`, all `components/*`, `useFavourites`).
- Produces: the assembled board. Export `MatchCard`, and types `Match`/`League` from `page.tsx` are used internally; the page passes a `renderMatch` callback to `CompetitionRow`.

- [ ] **Step 1: Add `oddsShown` prop to `MatchCard`**

In `page.tsx`, change the `MatchCard` signature and gate the odds board on it:

```tsx
function MatchCard({ match, league, oddsShown = true }: { match: Match; league?: League; oddsShown?: boolean }) {
```

Then, in the expanded section of `MatchCard`, wrap the existing `<OddsBoard .../>` usage so it only renders when `oddsShown` is true (find the `match.odds && ...` block and add `oddsShown && match.odds && (...)`).

- [ ] **Step 2: Replace board state + imports at the top of `PredictorPage`**

Add imports below the existing ones:

```tsx
import { BoardHeader, type BoardTab } from "./components/BoardHeader";
import { CompetitionRow } from "./components/CompetitionRow";
import { CompetitionsTab } from "./components/CompetitionsTab";
import { FilterBar } from "./components/FilterBar";
import { groupByCompetition, visibleCompetitions, type BoardLeague, type StatusFilter } from "./board";
import { useFavourites } from "./useFavourites";
```

Replace the `country` / `leagueId` state with:

```tsx
const [tab, setTab] = React.useState<BoardTab>("all");
const [status, setStatus] = React.useState<StatusFilter>("live");
const [oddsShown, setOddsShown] = React.useState(false);
const [leagueId, setLeagueId] = React.useState<number | null>(null);
const { favourites, isFavourite, toggle } = useFavourites();
```

- [ ] **Step 3: Replace the derived-data + render block**

Replace the old `visibleLeagues`/`activeLeagueIds`/`byLeague` derivation and the two `<nav>` filter blocks + `<section>` with:

```tsx
const leaguesById = new Map<number, BoardLeague>(
  leagues.map((l) => [l.id, { id: l.id, name: l.name, country: l.country }]));
const groups = groupByCompetition(matches ?? [], leaguesById);
const liveCount = (matches ?? []).filter((m) => isLive(m.status)).length;
const competitions = visibleCompetitions(groups, {
  status, favourites, onlyFavourites: tab === "favourites", leagueId,
});
```

Render (replacing both old `<nav>`s and the old `<section>`):

```tsx
<BoardHeader tab={tab} onTab={(t) => { setTab(t); setLeagueId(null); }} favouriteCount={favourites.size}>
  <DateStrip days={days} selected={selectedDate} onSelect={setSelectedDate} />
</BoardHeader>

{tab === "competitions" ? (
  <CompetitionsTab
    leagues={leagues.map((l) => ({ id: l.id, name: l.name, country: l.country }))}
    onPick={(id) => { setLeagueId(id); setTab("all"); }}
  />
) : (
  <>
    <FilterBar status={status} onStatus={setStatus} liveCount={liveCount}
      oddsShown={oddsShown} onOddsToggle={() => setOddsShown((v) => !v)} />
    <section aria-label="Competitions">
      {matches === null && !error && (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading fixtures…</p>
      )}
      {matches !== null && competitions.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No {status} matches{tab === "favourites" ? " in your favourites" : ""} for this day. Try another day or filter.
        </div>
      )}
      {competitions.map((g) => (
        <CompetitionRow key={g.league.id} group={g} status={status}
          isFavourite={isFavourite(g.league.id)}
          onToggleFavourite={() => toggle(g.league.id)}
          renderMatch={(m) => (
            <MatchCard key={m.id} match={m} league={leaguesById.has(m.league_id) ? leagues.find((l) => l.id === m.league_id) : undefined} oddsShown={oddsShown} />
          )} />
      ))}
    </section>
  </>
)}
```

Remove the now-unused `country`/`countries` code and the old `chip()` helper if no longer referenced (keep it only if still used).

- [ ] **Step 4: Run lint + tests + build**

```bash
npm run lint && npx vitest run && npm run build
```
Expected: lint clean; all vitest tests pass; Next.js build succeeds.

- [ ] **Step 5: Visual check against a backend**

Start the backend in mock mode (`cd ../football-predictor && .venv/bin/uvicorn app.main:app --reload`) and the portal (`npm run dev`), open `/predictor`. Confirm: competition rows with count badges; Live/Finished/Upcoming switches the set and the Live chip shows a count; Odds toggle shows/hides odds inside an expanded match; star pins a competition to the top and survives reload; Competitions tab search filters and picking one filters the board.

- [ ] **Step 6: Commit**

```bash
git add app/predictor/page.tsx
git commit -m "feat: SofaScore-style competition board on /predictor"
```

---

### Task 12: Thread A — schedule broad + live SofaScore jobs from a reachable host (ops)

**Files:**
- Create: `football-predictor/docs/FULL_BOARD_INGEST.md`
- Create: `football-predictor/scripts/full_board_cron.sh`

**Interfaces:**
- Consumes: existing `scripts/sofascore_broad.py`, `scripts/sofascore_live.py`, and `DATABASE_URL` (prod Postgres, supplied by the operator).
- Produces: a runbook + a wrapper script the operator points at cron/launchd. No app code changes.

**Note:** This task is ops. It does not run against production automatically — it documents and scaffolds. Validate locally against a dev DB; production `DATABASE_URL` is supplied by the operator.

- [ ] **Step 1: Write the cron wrapper** — `football-predictor/scripts/full_board_cron.sh`

```bash
#!/usr/bin/env bash
# Full-board SofaScore ingest from a reachable (non-datacenter) host.
# Point DATABASE_URL at the production Postgres before scheduling.
# Usage (crontab, host TZ):
#   */5 * * * *  /path/to/football-predictor/scripts/full_board_cron.sh live
#   0   3 * * *  /path/to/football-predictor/scripts/full_board_cron.sh broad
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DATABASE_URL:?set DATABASE_URL to the production Postgres URL}"
PY=".venv/bin/python"
case "${1:-broad}" in
  broad) exec "$PY" scripts/sofascore_broad.py ;;
  live)  exec "$PY" scripts/sofascore_live.py ;;
  *) echo "usage: $0 {broad|live}" >&2; exit 2 ;;
esac
```

- [ ] **Step 2: Make it executable**

```bash
cd ../football-predictor && chmod +x scripts/full_board_cron.sh
```

- [ ] **Step 3: Write the runbook** — `football-predictor/docs/FULL_BOARD_INGEST.md`

```markdown
# Full-board SofaScore ingest

Production's scheduled `espn_sync` only covers curated competitions. SofaScore's
Cloudflare blocks the deploy host's datacenter IP, so the full board must be
pulled from a **reachable host** (a laptop or a residential/allow-listed VPS)
that writes to the **production Postgres**.

## Setup
1. On the reachable host, clone the repo and create the venv
   (`python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`).
2. Export the production DB URL: `export DATABASE_URL="postgresql://…"`.
3. One-off validation: `scripts/full_board_cron.sh broad` then hit
   `/matches/by-date?date=<today>` and confirm exotic competitions appear.

## Schedule (crontab on the reachable host, host timezone)
```
*/5 * * * *  DATABASE_URL="postgresql://…" /path/to/football-predictor/scripts/full_board_cron.sh live
0   3 * * *  DATABASE_URL="postgresql://…" /path/to/football-predictor/scripts/full_board_cron.sh broad
```

## Trade-off
A laptop-hosted cron is skipped while the machine is asleep/off, so the daily
broad pull can miss a day. For always-on coverage use a small VPS whose IP
SofaScore does not block. Revisit a proxy-in-scraper approach only if neither a
laptop nor a VPS is workable.
```

- [ ] **Step 4: Local validation (dev DB, no prod credentials)**

```bash
cd ../football-predictor
export DATABASE_URL="sqlite+aiosqlite:///$PWD/data/dev.db"
.venv/bin/python scripts/init_db.py
.venv/bin/python scripts/sofascore_live.py
```
Expected: prints a nonzero "touched" count (live matches ingested), proving the wrapper + script + DB path work end-to-end. (If SofaScore is unreachable from the current network it prints 0 — note that and rely on the reachability probe already run during design.)

- [ ] **Step 5: Commit**

```bash
git add scripts/full_board_cron.sh docs/FULL_BOARD_INGEST.md
git commit -m "ops: full-board SofaScore ingest wrapper + runbook"
```

---

## Self-Review

**Spec coverage:**
- Collapsed competition list + count badge → Tasks 3, 7, 11. ✅
- Live/Finished/Upcoming filter → Tasks 1, 4, 8, 11. ✅
- Odds toggle → Tasks 8, 11 (MatchCard gating). ✅
- Favourites tab + persistence → Tasks 5, 9, 11. ✅
- Competitions tab (searchable) → Tasks 10, 11. ✅
- Flags with initials fallback → Tasks 2, 6. ✅
- Full-board data in production → Task 12 (Thread A). ✅
- Reuse MatchCard/helpers/DateStrip/WebSocket → Task 11. ✅

**Placeholder scan:** No TBD/TODO; every code step has concrete code; commands have expected output. ✅

**Type consistency:** `StatusFilter`, `BoardLeague`, `BoardMatch`, `CompetitionGroup`, `groupByCompetition`, `visibleCompetitions`, `countryFlag`, `parseFavourites`/`serializeFavourites`, `useFavourites`, `BoardTab` are defined once and referenced with matching names/signatures across tasks. `CompetitionRow` takes `renderMatch` (avoids circular import with `MatchCard`). ✅

**Known trade-off:** Component-level tests are omitted (no DOM test infra in this repo); components are verified via lint + build + a scripted visual check in Task 11. Pure logic is fully TDD'd. This matches the repo's existing no-test-runner convention while still testing the risk-bearing logic.
