# Portfolio Redesign Plan — hulsambath.me

_Drafted 2026-10-14. Planning only, no code has changed yet. Every phase below
is meant to be reviewed and merged on its own._

### Decisions (2026-10-14)

| Question | Decision |
|---|---|
| Job title | **"Software Engineer"** everywhere: hero, metadata, OG image, CV. Flutter/mobile is expressed in the supporting line, not the title |
| Canonical domain | **`hulsambath.me`**. Fix `robots.txt`, `sitemap.xml`, `metadataBase` and docs |
| Kava | **Don't describe it yet.** It stays a featured slot, but no pitch, role or outcome copy is written until you provide it. Its case-study page is deferred |
| Hang Meas | **Keep the current wording** ("Got Talent, The Voice Cambodia", "primary author/maintainer, 358 commits") |
| Accent colour | **Keep the orange**, darkened to `#C2410C` in light mode for AA |

---

## 1. Current state

### 1.1 Tech stack, build, deploy

| Area | What is there today |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript 6 |
| Output | `output: "export"`: a fully static site in `out/`, with `images.unoptimized: true` |
| Styling | Tailwind CSS 3.4 and shadcn-style HSL CSS variables (`app/globals.css`, `tailwind.config.js`), `@tailwindcss/typography` |
| UI primitives | `components/ui/{button,card,badge,input}.tsx` (shadcn: CVA + `tailwind-merge`), `lucide-react` installed but barely used (icons are inline SVG) |
| Theming | `next-themes` with `defaultTheme="system"`. **There is no toggle in the UI.** |
| Fonts | Inter, loaded through a render-blocking `@import url(fonts.googleapis.com)` in `globals.css` |
| Content | `src/content/site.js` is the single source. `generate_llms.mjs` turns it into `public/llms*.txt` on `predev`/`prebuild` |
| Tests | Vitest. Today it covers only `/generate-qr` and `/predictor`, not the portfolio page |
| Deploy | GitHub Actions on push to `develop`, Node 20, `npm ci && npm run build`, then upload `out/` to GitHub Pages |
| Security | CSP is set as a `<meta>` tag in `app/layout.tsx`, because GitHub Pages cannot set headers |

Other routes share the root layout and `globals.css`: `/predictor` (its own
neubrutalist CSS), `/kp-trip`, `/generate-qr`, and deep-link pages in `public/`.
**The redesign has to leave them visually untouched** (see Risks).

### 1.2 Pages, sections, components

The portfolio itself is one route, `/` (`app/page.tsx` → `src/App.tsx`, **1,031 lines, all
`"use client"`**). Sections in order:

1. **Nav**: fixed, `backdrop-blur`, seven scroll-anchor buttons, and an `llms.txt` button.
2. **Hero**: "Available for Engineering Roles" ping badge, gradient-text name, title
   "Mobile & Applied AI Software Engineer", CTAs (Explore Projects, Download CV),
   social icons, and a "dossier" portrait card with glow, crosshairs, GPS coordinates
   and floating badges. Below it, a stats strip: *3 Years · 8 Apps · 6 OS · 100% Offline*.
3. **About**: bio, a second stats grid from `site.stats`, an Education card and a "What I Do" list.
4. **Skills**: three skill-bar groups with "years" per skill, then six technology icon groups.
5. **Projects**: 11 equal cards in a 3-column grid. Each card has an app icon, a long
   description, tech chips and store/source/demo buttons.
6. **Experience**: a vertical timeline with four entries.
7. **Credentials**: `src/components/CredentialsSection.tsx` (557 lines), which holds
   documents and a modal viewer.
8. **Contact**: info list and a form.
9. **Footer**: socials and copyright.

### 1.3 Content inventory

**What exists:** portrait (`sambath_portrait.jpg`, 896×1152, 72 KB), app icons for every
project, store badges, ~25 tech logos, `Sambath_HUL_CV.pdf` (808 KB), the supporting-documents
PDF (1 MB), three credential scans, and store links for Hang Meas, BookMeBus, iBUS,
BS Bus, Oudong Express and CAO Farm Book.

**What is missing:**
- **Kava does not appear on the site at all.**
- There are **no app screenshots anywhere.** Projects only show the 1024px app icon.
- There is no Open Graph image or OG/Twitter meta, no canonical URL, no `metadataBase`,
  no favicon set beyond `favicon.png`, and no `apple-touch-icon`.
- There is no per-project page. All detail lives in one paragraph per card.

**What is outdated or overstated.** This matters for the recruiter and scholarship audience:

| Where | Current text | Problem |
|---|---|---|
| Hero stats strip, About copy, `site.stats`, `generate_llms.mjs:23` → `llms.txt` | "3 Years" / "3 years of hands-on experience" | Real figure is ~2 yrs 9 mo (CamMob internship Jan 2024 → BookMeBus Jun 2024–now). Rounding up is exactly the overstatement to avoid. |
| `site.skills.*.years` | "Flutter 3 yrs", "JavaScript 3 yrs", "React 2 yrs" | Same issue. Per-skill years invite scrutiny and can't all be true. |
| Experience → VisionCareAI | "Lead Full-Stack & ML Mobile Engineer", listed as a job | It is a CADT capstone. It belongs under projects or education, not employment. |
| Experience → "Personal Projects 2023 – Present" | Listed as a role | Same. It inflates the timeline. |
| Hero badge / stats | "100% Offline Edge AI", "6 OS", "8 Apps Built & Shipped" | "Shipped" is only true for the store apps. "6 OS" counts Flutter build targets, not releases. |
| Hang Meas description | "Got Talent, The Voice Cambodia" | ~~Brief says X Factor~~. **Decided: keep as is.** |
| "Portfolio Website" project | "React, Tailwind, Vite"; source `hulsambath.github.io` | The site is now Next.js. Vite was removed. |
| `site.testimonials` | "Chan Sophea, TechCorp Solutions", "Kim Dara, MobileFirst Inc" | These look like placeholders. They are not rendered today, but should be deleted so they can never ship. |
| `site.resume.href` | `/resume.pdf` | The file doesn't exist (the CV is `Sambath_HUL_CV.pdf`). The field is unused. |
| `site.author.age: 22` | — | Unused. Personal data that doesn't belong in the content file. |
| Title inconsistency | "Software Engineer" (meta, card) vs "Mobile & Applied AI Software Engineer" (hero) | **Decided: "Software Engineer"** everywhere. |
| `robots.txt`, `sitemap.xml`, docs | `hulsambath.github.io` | **Decided: canonical is `hulsambath.me`**. These need updating. |
| Footer LinkedIn | `linkedin.com/in/hulsambath` vs `www.linkedin.com/in/hulsambath/` in `site.js` | Hardcoded and duplicated outside the content file. |

### 1.4 Main problems

**Layout and hierarchy**
- The page is long and flat: nine stacked sections with the same "centered H2 + subtitle"
  pattern. A recruiter on a phone has to scroll past the hero, about and two skills sections
  before reaching any project.
- All 11 projects get equal weight. Flagship work (Hang Meas, BookMeBus) sits next to a
  Netflix clone and the portfolio site itself.
- Stats appear **twice** (hero strip and About), with different values ("3 Years" vs "3").
- The visual language is noisy and conflicts with the minimal direction: gradient text,
  glow blur, ping animations, crosshairs, coordinates, and emoji icons.

**Responsiveness**
- **There is no mobile navigation.** Nav links are `hidden md:flex` and nothing replaces them,
  so phones get only the logo and an `llms.txt` button.
- The hero is `min-h-[92vh]` with the portrait stacked below the copy, which pushes the CTAs
  and stats far down on small screens.
- Project cards have uneven heights driven by paragraph length.

**Accessibility**
- The nav logo is a clickable `<div>`, so it isn't keyboard-focusable and has no role.
- Nav items are `<button>`s that call `scrollIntoView` rather than `<a href="#id">` links.
  You can't middle-click or copy them, and screen readers don't announce them as links.
- There is no skip link, and no `aria-current` on the active section.
- `animate-ping`/`animate-pulse` and `scroll-behavior: smooth` ignore `prefers-reduced-motion`.
- Primary orange `#FF6F00` on white is **2.79:1**, which fails WCAG AA for normal text.
  It is used for text links ("Verified Degree", CADT link) and for white-on-orange buttons.
- The portrait's `alt` is only the name, and card images repeat the title as alt (redundant).
- The **contact form is fake**: submit opens `mailto:` and drops what you typed. That is
  misleading for users and assistive tech alike.
- Scroll-spy uses a `scroll` listener without `passive`. It works, but it is the heavier option.

**Performance**
- The whole home page is a client component, so all content ships as hydrated JS.
- The Google Fonts `@import` blocks rendering and loads five weights.
- `images.unoptimized` plus raw `<img>` tags mean no `width`/`height` (layout shift risk),
  no `loading="lazy"`, and no WebP/AVIF.
- The CV is fetched as a blob in JS to force a download. A plain `<a download>` does the same.

**Consistency and maintainability**
- `App.tsx` mixes layout, data mapping, ~20 inline SVG icons and handlers in 1,031 lines.
- Colors are hardcoded (`#B744B8`, `#80808012`, `emerald-*`, `amber-*`) alongside tokens.
- Footer socials are hardcoded instead of coming from `site.author.social`.

---

## 2. Information architecture

### 2.1 Routes

| Route | Purpose | Status |
|---|---|---|
| `/` | Home: hero → bento → experience/skills → contact | Rewrite |
| `/projects/kava` | Case study | **Deferred** until you provide Kava copy |
| `/projects/hang-meas` | Case study | **New** |
| `/projects/bookmebus` | Case study covering the BookMeBus family (BookMeBus, iBUS, BS Bus, Oudong Express) | **New** |
| `/projects/[slug]` for others | Optional (Trovara, VisionCareAI, CAO Farm Book) | Later; not in this plan |
| `/predictor`, `/kp-trip`, `/generate-qr` | Unchanged | Do not touch |

Project pages are built with `app/projects/[slug]/page.tsx`, using `generateStaticParams()` over
the `site.projects` entries that have a `caseStudy`, plus `export const dynamicParams = false`.
`output: "export"` requires both, and unknown slugs then 404 instead of failing the build. The
pages stay fully static and need no new dependency.

### 2.2 Home section order

1. **Navbar** (sticky, glass, the only glass element): name/monogram on the left; *Work · Experience · Contact* in the
   middle; theme toggle and **CV** button on the right. On mobile it collapses to a menu button.
2. **Hero**, compact (no `min-h-screen`). One line of identity, one line of value, two CTAs.
   - H1: "Sambath HUL"
   - Role: "Software Engineer · Phnom Penh"
   - One sentence (draft, to confirm): "I build and ship production mobile apps with Flutter,
     including live TV-show voting and bus & ferry booking, used by real customers in Cambodia."
     It leaves out travel planning until Kava can be described.
   - CTAs: **View work** (scrolls to bento), **Download CV** (`<a download>`).
   - Small portrait (circle or rounded square, ~96–128 px). The big dossier card is dropped.
3. **Bento grid**: featured projects and quick facts in one scannable block (§3).
4. **Experience**: a compact list with employers only (BookMeBus, CamMob internship). Each has
   2–3 bullets max and links to the relevant project pages.
5. **Skills**: one tile row or chip list grouped as *Mobile · Backend · Tooling*. **No years and
   no skill bars.**
6. **Education & credentials**: the CADT degree (verified link) and certificates, in a lighter
   version of the current `CredentialsSection`.
7. **Contact / footer**: email (copy button and `mailto:`), LinkedIn, GitHub, CV, location.
   No fake form. `llms.txt` moves to a small footer link.

The current "About" section is cut. Its useful content goes into the hero sentence, the
"Snapshot" bento tile and the Education section.

---

## 3. Bento grid

### 3.1 Tiles (in DOM order, which is also the mobile reading order)

| # | Tile | Content | Desktop size (4-col) | Tablet (2-col) | Mobile (1-col) |
|---|---|---|---|---|---|
| 1 | **Kava** (featured) | **For now:** name, "Flutter + FastAPI" (the only detail from your brief), and a "Case study coming soon" label, with no pitch and no link. There is no Kava icon in `public/assets/` yet, so the tile uses a text monogram until you send one. **Later:** 1–2 phone mockups, a pitch, and a link to the case study | **2×2** | 2×1 (mockup beside text) | full width, 1 mockup |
| 2 | **Hang Meas** | 1 phone mockup, the current one-line description (Got Talent / The Voice Cambodia live voting), store badges, → case study | 2×1 | 2×1 | full width |
| 3 | **BookMeBus apps** | Icon row (BookMeBus, iBUS, BS Bus, Oudong), with the line "The BookMeBus travel app and the iBUS, BS Bus and Oudong Express operator apps". This does **not** say "one codebase": per `PORTFOLIO_ACHIEVEMENTS.md`, BookMeBus is a separate repo from the white-label operator app. → case study | 2×1 | 2×1 | full width |
| 4 | **Snapshot** | Experience duration (see below) · "Software Engineer (Mobile), BookMeBus, since Jun 2024" | 1×1 | 1×1 | full width |
| 5 | **Core stack** | Flutter · Dart · Firebase · FastAPI · CI/CD (5–6 logos, no years) | 1×1 | 1×1 | full width |
| 6 | **Education** | BSc Software Engineering, CADT 2025, with a "Verified" link to verify.gov.kh | 1×1 | 1×1 | full width |
| 7 | **Recognition** | BookMeBus Certificate of Appreciation (signed by the CTO, May 2025) and the ISTAD 80-hour Flutter course. Links to the credentials section. The CV is already in the hero, navbar and footer, so it doesn't need a tile too | 1×1 | 1×1 | full width |
| 8 | **More work** | Trovara, VisionCareAI (capstone), CAO Farm Book as small rows with icon and link | 2×1 | 2×1 | full width |
| 9 | **Location / availability** | "Phnom Penh · open to roles / scholarships" (wording to confirm) | 1×1 | 1×1 | full width |
| 10 | **Contact** | Email and LinkedIn shortcuts | 1×1 | 1×1 | full width |

**Experience duration must not be hardcoded.** A fixed "2 yrs 9 mo" is accurate today but goes
stale every month, and the stale version understates the figure. Store
`careerStart: "2024-01"` in `site.js` and compute "2 yrs 9 mo" (floor, never round up) at build
time. The site redeploys on every push, and it can also run on a monthly scheduled
`workflow_dispatch`. `generate_llms.mjs` and the CV wording use the same value.

**Fallback for Kava:** if you'd rather not show an undescribed tile at all, Hang Meas takes the
2×2 slot and BookMeBus becomes 2×2 in the other half. Kava then drops into the slot when its
content is ready. This is one change in `site.js` (`featured` order).

On desktop the layout fills to: rows 1–2 = tiles 1, 2, 3; row 3 = tiles 4–7; row 4 = tiles 8–10.
No gaps, no `grid-auto-flow: dense` surprises.

```
Desktop ≥1024px (4 cols)          Tablet 640–1023px (2 cols)    Mobile <640px
┌───────────┬───────────┐         ┌───────────────────┐         ┌─────────┐
│           │ Hang Meas │         │ Kava (2×1)        │         │ Kava    │
│ Kava 2×2  ├───────────┤         ├───────────────────┤         │ HangMeas│
│           │ BookMeBus │         │ Hang Meas         │         │ BMB     │
├─────┬─────┼─────┬─────┤         ├───────────────────┤         │ Snapshot│
│Snap │Stack│Edu  │Recog│         │ BookMeBus         │         │ Stack   │
├─────┴─────┼─────┼─────┤         ├─────────┬─────────┤         │ Edu     │
│ More work │Loc  │Cont.│         │Snapshot │ Stack   │         │ Recog   │
└───────────┴─────┴─────┘         ├─────────┼─────────┤         │ More    │
                                  │ Edu     │ Recog   │         │ Loc     │
                                  ├─────────┴─────────┤         │ Contact │
                                  │ More work         │         └─────────┘
                                  ├─────────┬─────────┤
                                  │ Loc     │ Contact │
                                  └─────────┴─────────┘
```

### 3.2 Rules

- Plain CSS grid via Tailwind: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, `gap-4 lg:gap-5`.
  Spans use `sm:col-span-2`, `lg:row-span-2`, and so on. No grid library.
- Tile max content width ~1120 px. Rows use `auto-rows-[minmax(11rem,auto)]` so text never clips.
- **A whole tile is clickable** when it leads to a case study. This uses the "stretched link"
  pattern: the heading contains the only `<a>`, and its `::after` covers the tile. Store badges
  sit above it with `relative z-10`, so they stay separately clickable and focusable. Wrapping
  the whole tile in `<a>` isn't possible, because store badges inside it would be nested links
  (invalid HTML).
- On mobile, tiles 4–7 can optionally become a 2-column mini-grid (`grid-cols-2`) so quick
  facts don't create a long scroll. I'll mock both and you can pick.
- **Glass:** the **navbar only** (translucent surface, `backdrop-blur`, 1 px border). Content
  scrolls behind it, so the effect is actually visible there. On a bento tile, glass would sit
  over a flat page background, where blur does nothing. It would just be a tinted card.
  Optional second use: the caption strip over a screenshot on case-study pages. The fallback is
  a solid surface, via a hand-written `@media (prefers-reduced-transparency: reduce)` rule
  (Tailwind 3 has no variant for it, and only Chromium supports it today) and
  `@supports not (backdrop-filter: blur(1px))`.

---

## 4. Project page template (`/projects/[slug]`)

Same layout for every project. All copy comes from a `caseStudy` object in `site.js`.

1. **Breadcrumb / back link**: "← All work"
2. **Header**: app icon, name, one-line pitch, chips for *Role · Company · Year(s) · Platform*,
   and store badges / source / demo link.
3. **Phone gallery**: 3–5 screenshots in phone frames. Horizontal scroll-snap on mobile, a row
   of 3 on desktop. Each has a caption under the frame ("Live vote counter during the show").
4. **Problem**: 2–4 sentences. Who it's for and what was hard.
5. **My role**: bullets of what *I* did, kept separate from what the team or company did.
   This is where accuracy matters most.
6. **Tech stack**: chips grouped as *App · Backend · Infra*.
7. **Highlights / how it works**: 2–3 short blocks (for example "Flavor-based white-label build
   system" for the operator apps).
8. **Outcome**: only verifiable facts (store release, number of brands shipped, live-show usage).
   **No invented metrics.** Leave the section out if there is nothing to state.
9. **Links**: store, demo video, source (if public).
10. **Next project →** card.

**Phone frame component.** A pure CSS/Tailwind `PhoneFrame` with a rounded device body, a thin
bezel, an optional notch, `aspect-[9/19.5]`, and the screenshot as `object-cover`. No image
frames and no mockup library. The bezel is near-black (`#0C0A09`) in **both** themes, like a real
device. In dark mode a 1 px `--border` outline separates it from the page.

---

## 5. Design tokens

Tokens live as CSS variables in `globals.css` and are mapped in `tailwind.config.js`. The
existing shadcn variable names (`--background`, `--primary`, …) are kept so `components/ui/*`
continues to work. New variables are added for the extra layers.

### 5.1 Colors

Warm-neutral base with **one** accent. **Decided:** keep your current orange as the brand,
darkened in light mode so it passes AA.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#FAFAF9` | `#0C0A09` | Page |
| `--surface` (`--card`) | `#FFFFFF` | `#1C1917` | Tiles, cards |
| `--surface-2` (`--muted`) | `#F5F5F4` | `#292524` | Inset areas, chips |
| `--border` | `#E7E5E4` | `#3A3532` | Tile borders, dividers |
| `--foreground` | `#1C1917` | `#FAFAF9` | Body text |
| `--muted-foreground` | `#57534E` | `#A8A29E` | Secondary text |
| `--primary` (accent) | `#C2410C` | `#FB923C` | Links, focus ring, primary button |
| `--primary-foreground` | `#FFFFFF` | `#1C1917` | Text on primary button |
| `--success` | `#15803D` | `#4ADE80` | "Verified" badge only |

Contrast, computed with the WCAG 2 formula (AA needs 4.5:1 for text):

| Pair | Ratio | |
|---|---|---|
| `#1C1917` text on `#FAFAF9` page | 16.74 | ✅ |
| `#57534E` muted on `#FFFFFF` / `#F5F5F4` | 7.63 / 6.99 | ✅ |
| `#C2410C` accent on `#FFFFFF` / `#FAFAF9` / `#F5F5F4` | 5.18 / 4.96 / 4.75 | ✅ (narrow on `--surface-2`, so accent text never goes on chips) |
| White on `#C2410C` button | 5.18 | ✅ |
| `#A8A29E` muted on `#1C1917` / `#292524` | 6.93 / 6.01 | ✅ |
| `#FB923C` accent on `#0C0A09` / `#1C1917` | 8.73 / 7.73 | ✅ |
| `#1C1917` on `#FB923C` dark-mode button | 7.73 | ✅ |
| `#15803D` / `#4ADE80` "Verified" | 5.02 / 10.04 | ✅ |
| Old `#FF6F00` on white (for reference) | 2.79 | ❌ |
| Tile borders `#E7E5E4` / `#3A3532` | 1.26 / 1.45 | Decorative only. Tiles are identified by their content, not the border, so the 3:1 non-text rule doesn't apply. Form inputs and focus rings use `--primary` (≥ 4.75:1) |

No gradients, except optionally the glass tint.

### 5.2 Typography

- **Inter** through `next/font/google`. It self-hosts at build time, so there is no render-blocking
  CSS import. Weights 400/500/600/700 only.
  - Optional: JetBrains Mono for small labels. I'd skip it to keep things lean.

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `display` | `clamp(2.25rem, 5vw, 3.5rem)` / 1.1 | 700 | Hero H1 |
| `h2` | 1.875rem / 1.2 (mobile 1.5rem) | 600 | Section titles |
| `h3` | 1.25rem / 1.3 | 600 | Tile and project headings |
| `body-lg` | 1.125rem / 1.6 | 400 | Hero sentence, case-study lead |
| `body` | 1rem / 1.6 | 400 | Default |
| `small` | 0.875rem / 1.5 | 500 | Meta, chips |
| `caption` | 0.75rem / 1.4 | 500 | Screenshot captions, labels (uppercase, tracking +0.04em) |

Body text is never smaller than 16 px on mobile. Line length is ≤ 68ch.

### 5.3 Spacing, radius, shadow, motion

- **Spacing:** Tailwind's 4 px scale. Tile padding is `p-5` mobile / `p-6` desktop; grid gap is
  `gap-4` / `gap-5`; section spacing is `py-16` mobile / `py-24` desktop.
- **Radius:** `--radius-tile: 1.5rem` (24 px), `--radius-inner: 1rem`, `--radius-chip: 9999px`,
  and phone frame `2.25rem`.
- **Shadow:**
  - Light mode: `0 1px 2px rgb(0 0 0 / .04)` and a 1 px border, with hover
    `0 4px 16px rgb(0 0 0 / .06)`.
  - Dark mode: no shadows. Borders and a surface lift only.
- **Motion:** 150–200 ms ease-out on hover/focus (border color, 2 px translate). No entrance
  animations, ping or pulse. Everything is wrapped in `motion-safe:`.

---

## 6. Components

| Component | Action | Notes |
|---|---|---|
| `components/ui/button.tsx` | **Reuse** | Restyle via tokens only |
| `components/ui/badge.tsx` | **Reuse** | Becomes `Chip` for tech tags |
| `components/ui/card.tsx` | **Refactor** → base for `BentoTile` | |
| `components/ui/input.tsx` | Leave | Not used on home after the form is removed |
| `components/theme-provider.tsx` | **Reuse** | Already `system` default |
| `src/components/CredentialsSection.tsx` | **Refactor** | Keep the modal viewer, simplify the visuals, check modal focus trap and return focus |
| `src/App.tsx` | **Split, then delete** | Into `src/sections/*`. `app/page.tsx` becomes a server component |
| `Navbar` | **New** (client) | Links, mobile menu (disclosure button, `aria-expanded`, Esc closes, focus management), theme toggle, CV button, glass |
| `ThemeToggle` | **New** (client) | `next-themes`. Cycles system → light → dark, or a two-state toggle (your choice). Avoids hydration flash via `mounted` guard |
| `Hero` | **New** (server) | |
| `BentoGrid` / `BentoTile` | **New** (server) | Size variants `sm`/`wide`/`feature`, optional `href` |
| `PhoneFrame` | **New** (server) | CSS-only device frame |
| `ScreenshotGallery` | **New** (server, CSS scroll-snap) | No carousel JS |
| `ProjectHeader`, `CaseStudySection` | **New** | For `/projects/[slug]` |
| `ExperienceList`, `SkillGroups`, `ContactBlock`, `Footer` | **New** (server) | Replace the timeline, skill bars and fake form |
| `SocialIcon` | **New** | Collects the ~20 duplicated inline SVGs. `lucide-react` covers mail/download/arrow; GitHub and LinkedIn stay as SVG |
| `site.js` | **Refactor** | Add `careerStart`, `featured`, `slug`, `caseStudy`, `screenshots[] {src, alt, w, h}`. Remove `testimonials`, `age`, `resume`, `skills.*.years`. Keep it plain JS, because `generate_llms.mjs` imports it from Node. Use JSDoc types rather than converting to TS |

**Dependencies:** no new runtime dependencies. `sharp` is already installed (0.34.5, as Next's
optional dependency). The image script would only add it explicitly to `devDependencies` so the
version is pinned (see §8).

---

## 7. Accessibility checklist (WCAG 2.2 AA)

- [ ] Every text/background pair at least 4.5:1, large text and meaningful icons / input borders / focus rings at least 3:1, in **both** themes (see the table in §5.1). Re-checked in Phase 1 on the real rendered colours.
- [ ] Focus ring visible on every interactive element (`focus-visible:ring-2 ring-primary ring-offset-2`), never removed.
- [ ] A skip link ("Skip to content") as the first focusable element.
- [ ] Landmarks: one `<header>`, `<nav aria-label="Primary">`, `<main id="content">`, `<footer>`. One `<h1>` per page and no skipped heading levels.
- [ ] Nav uses `<a href="#work">` / route links (on case-study pages, `/#work`). `aria-current="page"` on routes. If scroll-spy is kept (§8.3), `aria-current="true"` on the active section.
- [ ] Sticky navbar doesn't cover anchor targets or focused elements: `scroll-margin-top` on sections (WCAG 2.2 "Focus Not Obscured").
- [ ] Mobile menu: `<button aria-expanded aria-controls>`, Esc closes it, focus moves into the menu and returns to the button.
- [ ] Theme toggle has an accessible name that reflects state ("Switch to dark theme").
- [ ] Bento tiles that link: one stretched link per tile, with the visible heading as its name. Store badges are separate, focusable and not nested.
- [ ] Alt text:
  - Screenshots get descriptive alt ("Hang Meas live vote counter showing two contestants").
  - Decorative icons get `alt=""`.
  - The portrait gets "Portrait of Sambath HUL".
  - App icons next to their name get `alt=""`.
- [ ] Every image has `width`/`height` so nothing shifts on load.
- [ ] `prefers-reduced-motion`: smooth scroll is set only under `motion-safe`, with no transforms or animations otherwise.
- [ ] `prefers-reduced-transparency`: glass becomes a solid surface.
- [ ] Touch targets at least 44×44 px on mobile, including icons and the theme toggle.
- [ ] External links: `rel="noopener noreferrer"`, plus a visually hidden "(opens in new tab)" where `target="_blank"` is used.
- [ ] The credentials modal: `role="dialog"`, `aria-modal`, labelled title, focus trap, Esc closes it (already present), and focus returns to the trigger.
- [ ] Text zoom to 200% and a 320 px viewport have no horizontal scroll, except intentional galleries.
- [ ] Verification: keyboard-only pass, VoiceOver (iOS Safari plus macOS), and Lighthouse/axe at 100 / no violations.

---

## 8. Performance and SEO

### 8.1 Page weight budget (home, first load, excluding the CV)

| Item | Budget |
|---|---|
| HTML + CSS | < 60 KB gzip |
| JS | Next 16 + React 19 runtime is roughly 100 KB gzip on its own, so the budget is **baseline + < 15 KB** for our islands (navbar, toggle, credentials modal). Phase 2 measures the baseline from `next build` output first |
| Images above the fold | < 150 KB |
| Total transfer | **< 500 KB** |

Core Web Vitals targets on a mid-range Android over 4G: **LCP < 2.5 s, CLS < 0.05, INP < 200 ms**.

### 8.2 Images

`next/image` optimization is off because of the static export. Options:

- **(Recommended)** A small `scripts/optimize-images.mjs` using `sharp`, which is already installed. You
  drop originals into `assets-src/screenshots/`, and it writes `public/assets/projects/<slug>/*.webp`
  at 1× and 2× widths (for example 300 and 600 px) plus a JSON manifest with width and height.
  It runs once when screenshots change. This follows the same pattern as the existing
  `setup_kp_trip_images.mjs`.
  - Trade-off: one explicit `devDependencies` line, and in return no manual export and
    consistent sizes. The script runs locally, not in CI, and its WebP output is committed.
- **Alternative (no new dependency):** export WebP by hand (Squoosh) at the agreed sizes and
  enter the sizes in `site.js`. Simpler, but error-prone over time.

Then render `<img srcset sizes loading="lazy" decoding="async" width height>`. Only the hero
portrait and the first featured tile's mockup (if it has one) are eager, and whichever is the
LCP element gets `fetchpriority="high"`.

Per-screenshot target is **≤ 60 KB at 2×**. The portrait should be re-exported as WebP at about
256 px (2×), which brings it to around 15 KB.

### 8.3 Other performance work

- `app/page.tsx` and the sections become **server components**, leaving only small client islands.
- Fonts move to `next/font`. The `@import` in `globals.css` goes, but **the CSP keeps
  `fonts.googleapis.com`** because `predictor.css` still imports Google Fonts.
- The CV becomes a plain `<a href download>`, removing the fetch-blob code. Consider compressing
  the CV PDF (808 KB → ideally < 300 KB).
- The scroll-spy listener is replaced by `IntersectionObserver`, or dropped entirely, since the
  nav will have only three links.

### 8.4 SEO and sharing

- Use the `metadata` API in `app/layout.tsx` and per page (`generateMetadata` for projects):
  - `metadataBase: https://hulsambath.me`, `title` template (`%s · Sambath HUL`), and a
    description like "Sambath HUL, Software Engineer in Phnom Penh building production Flutter
    mobile apps"
  - `alternates.canonical`, `openGraph` (type, url, siteName, images), and
    `twitter: summary_large_image`.
- **OG image:** a static `public/og/default.png` (1200×630) plus one per case study, showing name,
  role and phone mockup. `opengraph-image.tsx` also works with static export, but a designed PNG
  is simpler to review and doesn't need fonts bundled for `ImageResponse`.
- Add `apple-touch-icon` (180 px), `icon.svg`, and a `theme-color` per scheme.
- JSON-LD `Person` on home (name, jobTitle, url, sameAs: GitHub/LinkedIn, alumniOf: CADT, worksFor:
  BookMeBus) and `SoftwareApplication` on store-listed case studies.
- Replace `public/robots.txt` and `public/sitemap.xml` with `app/robots.ts` and `app/sitemap.ts`
  (`export const dynamic = "force-static"`). These are built from `site.js` at build time, so new
  case studies appear in the sitemap automatically. That means no extra script, and the
  `public/` copies are deleted to avoid conflicts. Phase 0 only edits the domain in the existing
  files.
- **Leave deep-link domains alone.** `public/note.html` (OG/App Link meta),
  `public/.well-known/assetlinks.json` and the `server/` OAuth config reference
  `hulsambath.github.io` for the NoteMyMinds app. Changing them could break the app's links.
  The canonical-domain change covers only the portfolio's own pages.
- Update `generate_llms.mjs`, which has "3 years" hardcoded, so `llms.txt` uses the computed
  duration and includes case-study summaries.

---

## 9. Content I need from you

| # | Item | Format / notes |
|---|---|---|
| 1 | **Kava screenshots + description** | **Deferred, on your request.** When ready: 4–6 portrait screens (raw PNG, no frames), plus pitch, your role, status (released or not), links |
| 2 | **Hang Meas screenshots** | 4–5 screens: vote counter, live stream, show detail, top-up. Confirm you're allowed to publish them (client app) |
| 3 | **BookMeBus family screenshots** | 3–5 across BookMeBus / iBUS / BS Bus / Oudong. Same permission question |
| 4 | **Case-study copy** per featured project | Problem (2–4 sentences), your exact role (what you personally did), stack, verifiable outcome, years. I can draft from the repos and `PORTFOLIO_ACHIEVEMENTS.md` for you to correct |
| 5 | **Updated CV PDF** | Matching the experience duration and the "Software Engineer" title, ideally < 300 KB. Phrase it as "since January 2024" so it doesn't go stale |
| 6 | **One-sentence pitch** | Or approve my draft in §2.2 |
| 7 | **Availability line** | e.g. "Open to Flutter roles and graduate scholarships", or nothing |
| 8 | **Portrait** | Current one is fine. A square crop would work better for the small hero avatar |
| 9 | **OG image approval** | I'll design it, you approve |
| 10 | **Real testimonials** | Only if you have permission from real people (name, role, quote). Otherwise the section stays out |

---

## 10. Implementation phases

Each phase is one PR/commit series that can be reviewed alone. Estimates are for focused work
and assume content arrives on time.

**Branching, because every push to `develop` deploys to production** (`.github/workflows/deploy.yml`):
- **Phase 0** is a small, self-contained copy fix. It merges straight to `develop` and goes live.
- **Phases 1–8** each get a PR into a long-lived `feat/portfolio-redesign` branch. Only that
  branch merges to `develop`, and only once the new home page is complete (end of Phase 4 at the
  earliest). This way a half-old, half-new home page never ships. Preview each phase locally
  with `npm run build && npx serve out`.

| Phase | Scope | Reviewable outcome | Effort |
|---|---|---|---|
| **0. Content truth pass** | Replace "3 years" with the computed duration from `careerStart` (§3.1) in `site.js` / About / hero / `generate_llms.mjs`. Remove per-skill years, placeholder testimonials, `age`, dead `resume`. Move VisionCareAI and personal projects out of Experience (pending open question 2). Fix the portfolio project description. Set the hero title to "Software Engineer". Point `robots.txt`/`sitemap.xml` at `hulsambath.me`. Hang Meas copy stays unchanged. **Text changes only, no layout or styling changes.** | Diff of copy only. `llms.txt` regenerated. Ships directly to `develop` | 1–2 h |
| **1. Tokens and theme** | New CSS variables (light/dark), Tailwind mapping, `next/font` Inter, `ThemeToggle`, a contrast check script or manual audit. Verify `/predictor`, `/kp-trip`, `/generate-qr` are unchanged (screenshots before and after) | Toggle works, system default respected, no flash, other routes unaffected | 3–4 h |
| **2. Layout shell** | Make `app/page.tsx` a server component that renders the existing sections, moved unchanged from `App.tsx` into `src/sections/*`. Add the new `Navbar` (glass, mobile menu, skip link), `Footer` and `SocialIcon`. Measure the JS baseline (§8.1) | Same content, new shell, keyboard/mobile nav working. `App.tsx` deleted | 4–6 h |
| **3. Hero and bento grid** | `Hero`, `BentoGrid`, `BentoTile`, `PhoneFrame`. Tiles show app icons until real screenshots arrive in Phase 5. **No placeholder or stock screenshots**, so nothing fake can ship | The home "above the fold" is done on mobile, tablet and desktop | 5–7 h |
| **4. Experience, skills, credentials, contact** | `ExperienceList`, `SkillGroups`, refactored `CredentialsSection`, `ContactBlock`. Remove the fake form and the old About/Skills/Projects sections | The full new home page. **Earliest point to merge the redesign branch to `develop`** | 4–6 h |
| **5. Image pipeline** | `scripts/optimize-images.mjs` (or manual WebP), screenshot manifest, `srcset`/lazy loading, portrait re-export | Real screenshots in place, image weights within budget | 2–3 h (+ your screenshot time) |
| **6. Project pages** | `app/projects/[slug]`, `generateStaticParams` (only for projects with a `caseStudy`), case-study components, Hang Meas and BookMeBus content, "next project" links, case-study summaries in `llms.txt`. Kava gets added later as a content-only change | Two static case-study pages | 5–7 h (+ copy review) |
| **7. SEO and sharing** | Metadata/OG/Twitter, OG images, JSON-LD, icons, `theme-color`, canonical domain, `app/sitemap.ts` + `app/robots.ts` (deep-link files untouched) | Valid previews (LinkedIn Post Inspector, opengraph.xyz), Lighthouse SEO 100 | 2–3 h |
| **8. QA and polish** | axe/Lighthouse, VoiceOver, keyboard pass, real-device check (iOS Safari plus Android Chrome), reduced motion/transparency, 320 px / 200 % zoom, page-weight check, Vitest content tests: the duration helper floors correctly, no hardcoded duration strings, and every case study has a slug and screenshot alt text. `vitest.config.ts` only includes `app/**/*.test.ts`, so the tests live in `app/` or the include gets widened to `src/**` | A checklist in §7 fully ticked | 3–4 h |

**Total: about 29–42 hours of build time**, plus your content work. Phases 0 and 1 can ship this
week independent of screenshots.

---

## 11. Risks and open questions

### Risks

1. **Shared global styles.** `globals.css` and the root layout also serve `/predictor`,
   `/kp-trip` and `/generate-qr`. Changing `--background`/`--primary` or the body font could
   restyle them. *Mitigation:* keep shadcn variable names, compare before/after screenshots of
   those routes in Phase 1, and scope portfolio-only rules under a `.portfolio` wrapper if needed.
2. **CSP meta tag.** New external origins (for example a YouTube embed for the Hang Meas demo)
   need CSP changes. *Default:* link out instead of embedding.
3. **Client app screenshots.** Hang Meas and the BookMeBus apps belong to the companies. Publishing
   screenshots may need permission. Public store-listing screenshots are usually safe.
4. **Uncommitted predictor work.** The working tree has unrelated, uncommitted `app/predictor/*`
   changes. The redesign should happen on its own branch (e.g. `feat/portfolio-redesign`) after
   those are committed or stashed, so the PRs don't mix.
5. **Static export limits.** There is no image optimization, no headers and no server. The plan
   already avoids anything that needs them (no `next/og` route, no form backend).
6. **Overstatement creep.** Stats tiles tempt rounding up. *Mitigation:* the duration is computed
   from `careerStart` with floor rounding, and a Phase 8 test fails if a hardcoded
   "N years"/"N yrs" string appears in `site.js`. A hardcoded "3 years" ban would wrongly fail
   once January 2027 makes it true.
7. **Deploy-on-push.** `develop` auto-deploys, so the redesign branch strategy in §10 is what keeps
   half-finished work off the live site.
8. **Deep links.** Changing the domain in `public/note.html` or `.well-known/` could break the
   NoteMyMinds app links. They are explicitly out of scope (§8.4).

### Open questions for you

The first round (title, domain, Kava, Hang Meas, accent) is answered and recorded under
**Decisions** at the top of this file. Still open. Each has a default I'll use if you don't
answer:

1. **Kava tile while undescribed:** show it as "Case study coming soon", or use the fallback in
   §3.1 and hide it until the content is ready? *Default: show "coming soon".*
2. **VisionCareAI and personal projects:** OK to move them out of Experience, with VisionCareAI
   becoming "More work · CADT capstone"? *Default: yes. This blocks Phase 0.*
3. **What to drop from home:** the Netflix clone, "Developer Tooling" and "Portfolio Website"
   cards (they stay on GitHub)? *Default: drop.*
4. **Theme toggle:** two states (light/dark, starting from system), or three
   (system/light/dark)? *Default: two.*
5. **Credentials section:** keep the full document viewer on home, or reduce it to the tiles
   plus a link to the supporting-documents PDF? *Default: keep the viewer, because scholarship
   reviewers may want it.*
6. **Availability line:** show "open to roles / scholarships"? Exact wording? *Default: omit.*
7. **Phone mockups on small phones:** one screenshot per featured tile, or text only, with
   mockups on the case-study pages? *Default: one per tile.*
8. **Image pipeline:** `sharp` script (already installed) or manual WebP export? *Default:
   the script.*
