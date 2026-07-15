# my-portfolio — Documentation

Engineering documentation for Sambath HUL's personal portfolio website.

> Generated 2026-06-11 by scanning the repository. Keep these docs in sync when
> the corresponding code changes.

## What this project is

A personal portfolio site (single scrolling page) plus a couple of standalone
extras that happen to share this repo:

- The **portfolio site** itself — a **Next.js 16 / React 19** app statically
  exported to **GitHub Pages**.
- A **`/kp-trip`** page — a standalone Kampot/Kep/Bokor trip guide.
- A **`server/`** OAuth backend — an Express service for the *NoteMyMinds*
  mobile app (unrelated to the portfolio UI; deployed separately).
- **Deep-link landing pages** (`public/note.html`, App Links / assetlinks) that
  use this site's GitHub Pages domain as a redirect target for the mobile app.

## Doc index

| Doc | Contents |
|---|---|
| [architecture.md](architecture.md) | Tech stack, active app structure, directory map |
| [routing.md](routing.md) | Routes, page structure, scroll-anchor nav |
| [content-model.md](content-model.md) | `src/content/site.js` — the single source of site content |
| [build-and-deploy.md](build-and-deploy.md) | Scripts, static export, GitHub Pages CI |
| [oauth-server.md](oauth-server.md) | The `server/` NoteMyMinds OAuth backend |
| [deep-linking.md](deep-linking.md) | `note.html`, Android App Links, universal links |

## Quick start

```bash
npm install
npm run dev      # Next.js dev server (runs setup_kp_trip_images.mjs first)
npm run build    # Static export to out/
npm run lint     # ESLint
```

Node version: `.tool-versions` pins **nodejs 23.7.0** locally; CI builds on
**Node 20**.
