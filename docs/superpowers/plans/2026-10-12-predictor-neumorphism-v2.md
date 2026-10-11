# Predictor UI v2 — Neumorphism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the `/predictor` portal (board + match detail) from the current flat bordered-card look to a neumorphic ("soft UI") look, in light and dark themes, without changing data, layout logic, or the backend contract.

**Architecture:** One design layer, two files. `app/predictor/predictor.css` owns the neumorphic tokens (surface, light shadow, dark shadow, per theme) and a small set of component classes (`neu-raised`, `neu-inset`, `neu-pressable`, …). `app/predictor/neu.ts` exposes those class names to TSX plus one state helper, so components never hand-roll shadows. Components swap their `border`/`bg-*` utility classes for these. A `predictor-shell` wrapper in `app/predictor/layout.tsx` paints the whole viewport in the surface colour (neumorphism only works when element and background share a colour) and scopes the tokens to both `/predictor` and `/predictor/match`.

**Tech Stack:** Next.js 16 app router (static export), React 19, Tailwind 3 (`darkMode: ["class"]`, next-themes), Vitest (node env, logic tests only).

**Spec:** this document (design section below); product direction in `docs/PREDICTOR_UI_ENHANCEMENT_PLAN.md`; API contract in `../docs/CODEX_PREDICTOR_INTEGRATION.md` (unchanged by this work).

## Design spec

- **Surface:** one surface colour per theme; cards, rows, chips and the page share it. Depth comes only from paired shadows: light from top-left, dark to bottom-right.
  - Light: surface `220 23% 92%`, highlight `0 0% 100%`, shade `220 18% 76%`.
  - Dark: surface `222 28% 15%`, highlight `222 24% 21%`, shade `224 34% 8%`.
- **Elevations:** `raised` (cards, competition sections, detail aside) · `raised-sm` (chips, cells, small buttons) · `inset` (inputs, progress tracks, empty states, sticky column header) · `inset-sm` (pressed/active controls).
- **Interaction:** `neu-pressable` is raised at rest, slightly lifted on hover, inset when `:active` or `aria-pressed="true"` / `aria-expanded="true"` is set. Active controls also change text colour to `--neu-accent`, so state never depends on shadow alone.
- **Accent:** `--neu-accent` = existing `--home` blue. The data colours (`--home`, `--draw`, `--away`, `--live`, `--edge`) keep their meaning.
- **Shape:** radius 14px for cards, 10px for chips/cells, full for pills; no 1px borders on neumorphic elements.
- **Accessibility:** body text keeps `foreground`/`muted-foreground` contrast (WCAG AA); visible `focus-visible` ring on every pressable; `prefers-reduced-motion` disables lift transitions.
- **Unchanged:** fonts (Barlow Condensed / IBM Plex Mono), grid columns, copy, data flow, WebSocket behaviour, routes.

## Global Constraints

- Scope: `my-portfolio/app/predictor/**` and its docs only — no edits to the rest of the portfolio, no backend changes.
- No new npm dependencies.
- Static export must still build: `npm run build`.
- `npm run test` and `npm run lint` stay green.
- The CSP in `app/layout.tsx` is untouched (no new origins).
- Deploy = push to `develop` (GitHub Pages workflow `.github/workflows/deploy.yml`).

## Review Focus

1. **Dark mode via system preference** — next-themes applies `.dark` on `<html>`; every neumorphic token must have a dark value or cards vanish into the page. Covered in Task 1 (tokens under `.dark .predictor-shell`) and checked visually in Task 5.
2. **Active state readable without shadows** (high-contrast mode, low-quality screens) — `neuPressable(true)` must also set the accent text colour. Unit test in Task 1.
3. **Sticky elements over scrolling content** — the sticky board header and column header previously used translucent `bg-background/75`; after the change they must use the opaque surface or rows bleed through. Task 3 sets `bg-[hsl(var(--neu-surface))]`.
4. **Match detail deep link (`/predictor/match?id=…`)** previously lacked the `predictor-page` token scope; the shell wrapper fixes this. Visual check in Task 5.
5. **Mobile width (375px)** — raised shadows add visual width; cards must not overflow horizontally. Visual check at 390px in Task 5.

---

### Task 1: Neumorphic tokens, classes and helper

**Files:**
- Modify: `app/predictor/predictor.css`
- Modify: `app/predictor/layout.tsx`
- Create: `app/predictor/neu.ts`
- Test: `app/predictor/neu.test.ts`

**Interfaces:**
- Produces: `neu` (record of class strings: `raised`, `raisedSm`, `inset`, `insetSm`, `pressable`, `surface`), `neuPressable(active: boolean, extra?: string): string`.

- [ ] **Step 1: Write the failing test** — `app/predictor/neu.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { neu, neuPressable } from "./neu";

describe("neumorphic class helpers", () => {
  it("marks active controls with an inset shadow and accent text", () => {
    const cls = neuPressable(true);
    expect(cls).toContain(neu.pressable);
    expect(cls).toContain("is-active");
    expect(cls).toContain("text-[hsl(var(--neu-accent))]");
  });

  it("keeps idle controls raised with muted text", () => {
    const cls = neuPressable(false, "px-3");
    expect(cls).not.toContain("is-active");
    expect(cls).toContain("text-muted-foreground");
    expect(cls.endsWith("px-3")).toBe(true);
  });
});
```

- [ ] **Step 2: Run it — expect FAIL** (`Cannot find module './neu'`): `npx vitest run app/predictor/neu.test.ts`

- [ ] **Step 3: Implement `app/predictor/neu.ts`**

```ts
/** Class names for the predictor's neumorphic surfaces; styles live in predictor.css. */
export const neu = {
  surface: "neu-surface",
  raised: "neu-raised",
  raisedSm: "neu-raised-sm",
  inset: "neu-inset",
  insetSm: "neu-inset-sm",
  pressable: "neu-pressable",
} as const;

/** A soft button: raised at rest, pressed-in and accent-coloured when active. */
export function neuPressable(active: boolean, extra = ""): string {
  const state = active
    ? "is-active text-[hsl(var(--neu-accent))]"
    : "text-muted-foreground hover:text-foreground";
  return [neu.pressable, state, extra].filter(Boolean).join(" ");
}
```

- [ ] **Step 4: Add tokens + classes to `predictor.css`** — rename the scope `.predictor-page` → `.predictor-shell` throughout, then add:

```css
.predictor-shell {
  --neu-surface: 220 23% 92%;
  --neu-light: 0 0% 100%;
  --neu-shade: 220 18% 76%;
  --neu-accent: var(--home);
  --background: var(--neu-surface);
  --card: var(--neu-surface);
  min-height: 100vh;
  background: hsl(var(--neu-surface));
  color: hsl(var(--foreground));
}
.dark .predictor-shell {
  --neu-surface: 222 28% 15%;
  --neu-light: 222 24% 21%;
  --neu-shade: 224 34% 8%;
}
.predictor-shell .neu-surface { background: hsl(var(--neu-surface)); }
.predictor-shell .neu-raised {
  background: hsl(var(--neu-surface)); border-radius: 14px;
  box-shadow: 6px 6px 14px hsl(var(--neu-shade)), -6px -6px 14px hsl(var(--neu-light));
}
.predictor-shell .neu-raised-sm {
  background: hsl(var(--neu-surface)); border-radius: 10px;
  box-shadow: 3px 3px 7px hsl(var(--neu-shade)), -3px -3px 7px hsl(var(--neu-light));
}
.predictor-shell .neu-inset {
  background: hsl(var(--neu-surface)); border-radius: 12px;
  box-shadow: inset 4px 4px 9px hsl(var(--neu-shade)), inset -4px -4px 9px hsl(var(--neu-light));
}
.predictor-shell .neu-inset-sm {
  background: hsl(var(--neu-surface)); border-radius: 10px;
  box-shadow: inset 2px 2px 5px hsl(var(--neu-shade)), inset -2px -2px 5px hsl(var(--neu-light));
}
.predictor-shell .neu-pressable {
  background: hsl(var(--neu-surface)); border-radius: 10px;
  box-shadow: 3px 3px 7px hsl(var(--neu-shade)), -3px -3px 7px hsl(var(--neu-light));
  transition: box-shadow 160ms ease, transform 160ms ease, color 160ms ease;
}
.predictor-shell .neu-pressable:hover { transform: translateY(-1px); }
.predictor-shell .neu-pressable:active,
.predictor-shell .neu-pressable.is-active {
  transform: none;
  box-shadow: inset 2px 2px 5px hsl(var(--neu-shade)), inset -2px -2px 5px hsl(var(--neu-light));
}
.predictor-shell .neu-pressable:focus-visible {
  outline: 2px solid hsl(var(--neu-accent)); outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .predictor-shell .neu-pressable { transition: none; }
  .predictor-shell .neu-pressable:hover { transform: none; }
}
```

Also replace the old `.dark .predictor-page` slate overrides (now provided by the shell) and change `.odds-cell:hover` to no longer set a background.

- [ ] **Step 5: Wrap the layout** — `app/predictor/layout.tsx` returns `<div className="predictor-shell">{children}</div>`.

- [ ] **Step 6: Run tests — expect PASS**: `npx vitest run app/predictor/neu.test.ts`

- [ ] **Step 7: Commit** `feat(predictor): add neumorphic design tokens and class helpers`

### Task 2: Board controls (header tabs, date strip, filters, odds toggle)

**Files:** Modify `app/predictor/components/BoardHeader.tsx`, `app/predictor/components/FilterBar.tsx`, `app/predictor/page.tsx` (`DateStrip`).

**Interfaces:** Consumes `neu`, `neuPressable` from Task 1.

- [ ] **Step 1:** BoardHeader tabs → a single `neu.inset` track (`p-1 inline-flex gap-1`) holding `neuPressable(active, "px-4 py-1.5 font-display …")`; remove the underline span.
- [ ] **Step 2:** FilterBar status pills → `neuPressable(active, "rounded-full px-3 py-1 …")`; when live is active add `text-[hsl(var(--live))]` instead of the accent. Quick filters → `neuPressable(active, "px-2.5 py-1 …")`. Odds toggle track → `neu.insetSm rounded-full`, knob → `neu.raisedSm rounded-full` coloured by `--neu-accent` when on.
- [ ] **Step 3:** DateStrip day buttons → `neuPressable(active, …)`; empty days add `opacity-50`; arrow buttons → `neuPressable(false, "rounded-full p-1.5")`. Give the strip `px-2 py-2` so shadows are not clipped by `overflow-x-auto`.
- [ ] **Step 4:** `npm run lint && npm run test` — PASS.
- [ ] **Step 5: Commit** `feat(predictor): neumorphic board controls`

### Task 3: Board content (competition sections, match rows/cards, cells, banners)

**Files:** Modify `app/predictor/components/CompetitionRow.tsx`, `app/predictor/components/CompetitionsTab.tsx`, `app/predictor/page.tsx`.

- [ ] **Step 1:** CompetitionRow container → `neu.raised mb-4` (drop `border bg-card overflow-hidden`, keep `overflow-hidden` off so shadows render); count badge → `neu.insetSm rounded-full`; expanded body → no border, `px-2 pb-2` with rows separated by `space-y-1.5`.
- [ ] **Step 2:** `MatchRowDesktop` → `rounded-xl` row on the plain surface (no border); the selected row gets `neu.insetSm` instead of `ring-1`; the Details button → `neuPressable(selected, …)`.
- [ ] **Step 3:** `MatchCardMobile` → `neu.raised` (live: add `ring-1 ring-[hsl(var(--live)/0.5)]`); "Open match details" → `neuPressable(false, "m-3 w-[calc(100%-1.5rem)] …")`.
- [ ] **Step 4:** `MarketCell` → `neu.raisedSm` (accent cell → `neu.insetSm` + edge text colour); `ModelEdgeStrip`, `StatChip`, `CornerSummary`, top-score chips → `neu.insetSm`/`neu.raisedSm`; `BadgeRow` → `neu.raisedSm rounded-full`; `TriBand` track and stats bars → `neu.insetSm rounded-full`.
- [ ] **Step 5:** Sticky board header and column header → opaque `bg-[hsl(var(--neu-surface))]` (no translucency/border); column header `neu.inset`. Banners, error box, empty state → `neu.inset` (error keeps `text-destructive`). Detail aside → `neu.raised`. Mobile drawer → `neu-surface`. Footer border → none; CompetitionsTab search input → `neu.inset`, list buttons → `neuPressable(false, …)`.
- [ ] **Step 6:** `npm run lint && npm run test` — PASS.
- [ ] **Step 7: Commit** `feat(predictor): neumorphic match board`

### Task 4: Match detail panel

**Files:** Modify `components/detail/MatchDetailPanel.tsx`, `DetailHeader.tsx`, `MatchStatsBars.tsx`, `TeamForm.tsx` (the `/predictor/match` page inherits the shell from `layout.tsx`, so `MatchPageClient.tsx` needs no change).

- [ ] **Step 1:** Detail tabs → `neu.inset` track + `neuPressable(active, …)`; sticky bar background → surface.
- [ ] **Step 2:** `PredictionSummary` → `neu.raised p-4`; outcome tiles + odds tiles → `neu.insetSm`; score/corner chips → `neu.raisedSm`; empty states → `neu.inset`; PredictButton + close button → `neuPressable(false, …)`.
- [ ] **Step 3:** DetailHeader crests → `neu.raised rounded-full p-1.5`; score block → `neu.inset px-4 py-2`; drop the bottom border. Stats bar tracks → `neu.insetSm`. Form chips keep their result colours.
- [ ] **Step 4:** `npm run lint && npm run test` — PASS.
- [ ] **Step 5: Commit** `feat(predictor): neumorphic match detail`

### Task 5: Verify, document, deploy

- [ ] **Step 1:** `npm run build` — static export succeeds.
- [ ] **Step 2:** Visual check against production API (`npm run dev`, `/predictor`): light + dark, desktop 1440px and mobile 390px; open a match; deep-link `/predictor/match?id=<id>`. Check Review Focus items 1–5.
- [ ] **Step 3:** Add a "UI v2 — neumorphism" note to `docs/PREDICTOR_UI_ENHANCEMENT_PLAN.md` (design tokens + where they live).
- [ ] **Step 4: Commit** docs, then `git push origin develop` (triggers GitHub Pages deploy); confirm the workflow run succeeds and `https://hulsambath.me/predictor` serves the new UI.
