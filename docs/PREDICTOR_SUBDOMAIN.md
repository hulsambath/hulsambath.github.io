# predictor.hulsambath.me — deployment guide

The predictor page lives at `app/predictor/` and talks to the
[football-predictor](https://github.com/hulsambath/football-predictor) API
(REST + WebSocket). It is fully client-side, so it works anywhere the static
export is hosted.

## Works immediately (no DNS changes)

After the next deploy from `develop`, the page is live at
**https://hulsambath.me/predictor** — GitHub Pages serves the whole `out/`
export, and `/predictor` is part of it.

## True subdomain (predictor.hulsambath.me)

GitHub Pages allows **one custom domain per repository**, and this repo's
Pages site already owns `hulsambath.me`. Two options:

**Option A — second GitHub Pages repo (stays on GitHub):**
1. Create a repo, e.g. `predictor-portal`, enable Pages.
2. Add a deploy step to `.github/workflows/deploy.yml` that pushes
   `out/predictor/` (plus `out/_next/`) to that repo's `gh-pages` branch —
   needs a `PAGES_DEPLOY_TOKEN` PAT secret with `repo` scope.
3. In `predictor-portal` Pages settings set custom domain
   `predictor.hulsambath.me`.
4. DNS: add `CNAME predictor → hulsambath.github.io`.

**Option B — Cloudflare Pages / Vercel for just the subdomain (simpler):**
1. Import this repo, build command `npm run build`, output `out`.
2. Assign the domain `predictor.hulsambath.me` in their dashboard.
3. DNS: add the CNAME they give you.

## The API must be public too

The page auto-targets **https://predictor-api.hulsambath.me** when served
from `*.hulsambath.me` (override with `NEXT_PUBLIC_PREDICTOR_API` at build
time). To stand it up:

1. Deploy football-predictor (e.g. Railway, like the NoteMyMinds server):
   Postgres + `uvicorn app.main:app`, run `scripts/init_db.py` once, cron
   `scripts/daily_sync.py` daily and `scripts/xbet_sync.py` every 6h.
2. Point DNS `CNAME predictor-api → <railway domain>` and add the custom
   domain in Railway.
3. The server's CORS defaults already allow `hulsambath.me` and
   `predictor.hulsambath.me`; the root layout's CSP meta tag already allows
   `https://predictor-api.hulsambath.me` and `wss://predictor-api.hulsambath.me`.

## Local development

```bash
# terminal 1 — API (mock mode, no key needed)
cd ../football-predictor
DATABASE_URL="sqlite+aiosqlite:///$PWD/data/dev.db" .venv/bin/uvicorn app.main:app --port 8000

# terminal 2 — portal
npm run dev
# open http://localhost:3000/predictor
```

The page falls back to `http://localhost:8000` when not on `*.hulsambath.me`.
