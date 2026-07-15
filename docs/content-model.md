# Content Model — `src/content/site.js`

**All** portfolio content is centralized in a single exported object,
`site`, in `src/content/site.js`. `src/App.tsx` imports it and renders every
section from it. To update the portfolio's text, edit this file — not the JSX.

## Top-level shape

```js
export const site = {
  author,          // identity + contact + socials
  stats,           // headline numbers (About section grid)
  skills,          // skill bars by category
  technologies,    // technology chips by category
  projects,        // project cards
  experience,      // work-history timeline
  testimonials,    // quotes (currently placeholder)
  resume,          // resume download link
};
```

## Fields

### `author`
`name`, `title`, `email`, `phones[]`, `location`, `age`, and
`social { github, linkedin, x }`.

### `stats`
Array of `{ label, value }`. Rendered in a `grid-cols-2 sm:grid-cols-4` grid.
Current values (3 items): `2+ Years Experience`, `4 Production Apps`,
`6 Platform Targets`.

### `skills`
Grouped `{ mobile[], web[], tools[] }`. Each entry:
`{ name, years, icon }` where `years` is a free-text experience label
(e.g. `"3 yrs"`, `"6 mo"`) shown next to the skill, and `icon` is a local asset
path under `/assets/*_logo.svg` (all tech logos are self-hosted — no CDN).
(No progress bars/percentages — replaced by `years`.)

### `technologies`
Grouped chips: `languages[]`, `frameworks[]`, `backend[]`, `tools[]`,
`architecture[]`, `developmentEnvironment[]`. Each entry: `{ name, icon }`.
Some use `icon: null` with `textColor` (text-only chip) or
`useLocalImage: true` (local asset, e.g. MCP logo).

### `projects`
Array of cards. Per project:

| Field | Notes |
|---|---|
| `icon` | Emoji shown as fallback when `image` is not set |
| `image` | Optional path to an app icon/logo (e.g. `/assets/bookmebus_icon.jpg`). When set, renders instead of `icon` |
| `title` | Card heading |
| `description` | Card body text |
| `tech[]` | Tech tag chips |
| `demoUrl` | Optional. `null`/`"#"` hides the button. YouTube URL → "Watch Demo", else "View Live" |
| `sourceUrl` | Optional. `null`/`"#"` hides the "Source" button |
| `playStoreUrl` | Optional. When set, renders a **Play Store** button (Google Play icon) |
| `appStoreUrl` | Optional. When set, renders an **App Store** button (App Store icon) |
| `company` | Optional label (e.g. company project attribution) |

Each button only renders when its URL is a non-null, non-`"#"` value, so a card
with all store/source/demo URLs null shows no action buttons. Button order in the
card: Play Store → App Store → Source → Demo.

Current projects (order = display order): BookMeBus, iBus, BS Bus Cambodia,
HangMeas App, Trovara, Oudong Express, Developer Tooling, Portfolio Website.
(iBus and BS Bus Cambodia are separate cards — both shipped from the shared
white-label operator codebase.)

> Store URLs (`playStoreUrl` / `appStoreUrl`) are present as `null` placeholders
> on every mobile app and must be filled with real listing links for the buttons
> to appear.

### `experience`
Timeline entries: `{ initials, role, company, companyUrl, period, bullets[] }`.

### `testimonials`
`{ quote, author, role }`. **Currently placeholder/sample data** — review before
relying on it publicly.

### `resume`
`{ href, filename }` for the resume download button. Note: `href` is
`/resume.pdf`, while the committed CV in `public/` is `Sambath_HUL_CV.pdf` —
verify the served path exists.

## Known stale content to review
- The **Portfolio Website** project entry and parts of the tech list still say
  *"React … automated GitHub Pages deployment"*. The site is now **Next.js 16**;
  GitHub Pages is still accurate but the framework label is outdated.
- `testimonials` are sample data.
- `resume.href` (`/resume.pdf`) vs the actual `public/Sambath_HUL_CV.pdf`.
