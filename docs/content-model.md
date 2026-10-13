# Content Model — `src/content/site.js`

**All** portfolio content is centralized in a single exported object,
`site`, in `src/content/site.js`. `src/App.tsx` imports it and renders every
section from it. To update the portfolio's text, edit this file — not the JSX.

## Top-level shape

```js
export const site = {
  author,          // identity + contact + socials
  career,          // experience duration, computed from the start month
  stats,           // headline numbers (About section grid)
  skills,          // skills by category
  technologies,    // technology chips by category
  projects,        // project cards
  experience,      // work-history timeline (employers only)
  credentials,     // degree + certificates
  supportingDocumentsBundle,
};
```

## Fields

### `author`
`name`, `title`, `email`, `phones[]`, `location`, and
`social { github, linkedin, x }`.

### `career`
`{ start, short, long }`. `start` is the `"YYYY-MM"` of the first professional
role (CamMob internship, January 2024). `short` ("2 yrs 9 mo") and `long`
("2 years 9 months") are computed by `src/content/experience.js`, which floors
partial months so the figure is never rounded up. The date used is
`process.env.BUILD_DATE` (inlined by `next.config.js`) or the current date in
Node scripts. **Never hardcode an experience duration anywhere**;
`src/content/experience.test.ts` guards this.

### `stats`
Array of `{ label, value }`. Rendered in a `grid-cols-2 sm:grid-cols-4` grid.
Current values: computed `Experience`, `8 Apps Built`, `6 Apps on the Stores`.

### `skills`
Grouped `{ mobile[], web[], tools[] }`. Each entry is `{ name, icon }`, where
`icon` is a local asset path under `/assets/*_logo.svg` (all tech logos are
self-hosted, no CDN). Per-skill years were removed because they overstated
experience.

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

Current projects (order = display order): BookMeBus, iBUS, BS Bus Cambodia,
HangMeas App, Trovara, Oudong Express, Developer Tooling, Portfolio Website.
(iBUS and BS Bus Cambodia are separate cards — both shipped from the shared
white-label operator codebase.)

> Store URLs (`playStoreUrl` / `appStoreUrl`) are present as `null` placeholders
> on every mobile app and must be filled with real listing links for the buttons
> to appear.

### `experience`
Timeline entries: `{ initials, role, company, companyUrl, period, bullets[] }`.
Employers only. The CADT capstone (VisionCareAI) and personal projects
(Trovara, Netflix clone) live in `projects`, not here.

### `credentials`
Array of verified credentials & institutional proof. Each entry:
`{ id, title, issuer, issuerUrl, category, badge, certificateNo, awardedDate, issuedDate, signatory, verificationUrl, image, description }`.
- `image`: Web-optimized certificate preview under `/assets/documents/*.jpg`.
- `verificationUrl`: Optional official cryptographic verification link (e.g. `https://verify.gov.kh/...`).
- Rendered in `#credentials` with high-resolution lightbox inspection.

### `supportingDocumentsBundle`
`{ title, filename, url, pages, size }` for the official 4-page submission dossier (`/Sambath_HUL_Supporting_Documents.pdf`).

## Removed fields
`testimonials` (placeholder quotes), `resume` (pointed at a non-existent
`/resume.pdf`; the CV is `public/Sambath_HUL_CV.pdf`) and `author.age` were
removed. Add testimonials back only with real, permitted quotes.
