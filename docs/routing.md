# Routing & Page Structure

The site is a Next.js App Router project with **2 routes**. The home route is a
single-page app; its nav links are in-page scroll anchors, not routes.

## Routes

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` → `src/App.jsx` | Main portfolio (single scrolling page) |
| `/kp-trip` | `app/kp-trip/page.tsx` | Standalone Kampot/Kep/Bokor motorbike trip guide |

`app/layout.tsx` is the shared root layout (not a route). There is no `route.ts`
API handler in the Next app — the only backend is the separate `server/`
service (see [oauth-server.md](oauth-server.md)).

## Home page (`/`) — section anchors

`src/App.jsx` renders one long page. The top nav scrolls to these `id`
anchors (no client routing involved):

| Nav item | Section `id` | Content |
|---|---|---|
| Home | `home` | Hero / intro, CTA buttons, headline stats |
| About | `about` | Bio, headline stats grid (`site.stats`), education |
| Skills | `skills` | Skill bars (`site.skills`) + technologies (`site.technologies`) |
| Projects | `projects` | Project cards (`site.projects`) |
| Experience | `experience` | Timeline (`site.experience`) |
| Contact | `contact` | Contact info + form |

All section content is data-driven from `src/content/site.js` —
see [content-model.md](content-model.md).

### Project card image logic
Cards render the `project.image` (app icon / logo) when present, otherwise they
fall back to the emoji in `project.icon` (`src/App.jsx`, projects section). This
is data-driven — no title matching. App-store apps use real icons scraped from
the App Store and stored in `public/assets/*_icon.jpg`.

### Project card action buttons
Each card renders, in order, any of: **Play Store** (`playStoreUrl`),
**App Store** (`appStoreUrl`), **Source** (`sourceUrl`), **Demo** (`demoUrl`).
Store icons are local assets (`/assets/googleplay_btn.svg`, `/assets/appstore_btn.svg`). A button
appears only when its URL is non-null and not `"#"`. See
[content-model.md](content-model.md) for the field definitions.

## `/kp-trip` page
- A self-contained client component (`"use client"`) built from `lucide-react`
  icons — a detailed trip itinerary/guide for Kampot, Kep, and Bokor.
- Has its own `layout.tsx`.
- Consumes trip photos from `public/trip-images/<place>/...`, which are populated
  at build time by `setup_kp_trip_images.mjs` (copies from `src/assets`) and a
  generated `manifest.json`.

## Extra static HTML (not Next routes)
These live in `public/` and ship as-is to the static site root:
- `public/note.html` — deep-link landing page for NoteMyMinds note shares.
- `public/app.html`, `public/kp_trip_draft.html` — standalone HTML pages.
- `public/404.html`, `robots.txt`, `sitemap.xml`.
