# Build & Deployment

## npm scripts (`package.json`)

| Script | Command | Purpose |
|---|---|---|
| `predev` | `setup_kp_trip_images.mjs && generate_llms.mjs` | Runs automatically before `dev` |
| `dev` | `next dev` | Next.js dev server (primary) |
| `prebuild` | `setup_kp_trip_images.mjs && generate_llms.mjs` | Runs automatically before `build` |
| `build` | `next build` | Production static export → `out/` |
| `start` | `next start` | Not used in production (static export is deployed) |
| `lint` | `eslint .` | Lint |
| `test` | `vitest run` | Frontend logic tests |

## Static export

`next.config.js`:

```js
{
  reactStrictMode: true,
  output: "export",          // emits a fully static site to out/
  images: { unoptimized: true } // required for static export
}
```

Because of `output: "export"`, there is **no Node server in production** — the
build produces static HTML/CSS/JS in `out/`, served by GitHub Pages.

## Trip-image pre-build step (`setup_kp_trip_images.mjs`)

Runs before every dev/build. It:
1. Walks `src/assets/{kampot,bokor,kep}/` for images.
2. Copies them into `public/trip-images/<place>/`.
3. Writes `public/trip-images/manifest.json` listing the resulting URLs.

The `/kp-trip` page and `kp_trip_draft.html` fetch this manifest to render the
photo galleries. Missing files in CI are skipped rather than failing the build.

## LLM text generation (`generate_llms.mjs`)

Also runs before every dev/build. It imports `src/content/site.js` and emits two
plain-text files into `public/` (served at the site root), following the
[llms.txt spec](https://llmstxt.org):
- `public/llms.txt` — concise index: identity, contact, project list, links.
- `public/llms-full.txt` — full portfolio (summary, education, skills with years,
  technologies, experience bullets, every project with store/source/demo links).

Because it's generated from `site.js`, the LLM files never drift from the site
content — edit `site.js`, not the `.txt` files. Education is mirrored as a
constant in the script (it lives in `App.tsx`, not `site.js`). `robots.txt`
points crawlers/agents at both files.

## CI/CD — GitHub Pages (`.github/workflows/deploy.yml`)

- **Trigger:** push to **`develop`** (the active branch) or manual
  `workflow_dispatch`.
- **Build job:** checkout → setup Node **20** (npm cache) → `npm ci` →
  `npm run build` → ensure `public/trip-images` is copied into `out/` →
  upload `out/` as a Pages artifact.
- **Deploy job:** `actions/deploy-pages@v4` to the `github-pages` environment.
- **Permissions:** `pages: write`, `id-token: write`.

### Notes / gotchas
- Deploy branch is `develop`, **not** `main`/`master`.
- CI uses Node 20; local `.tool-versions` pins Node 23.7.0 — keep an eye on
  drift if a build behaves differently locally vs CI.
- Deployed domain: **`hulsambath.github.io`** (also referenced by the OAuth
  server CORS allowlist and deep-link redirects).
- `out/` and `dist/` are generated build artifacts — do not edit by hand.
