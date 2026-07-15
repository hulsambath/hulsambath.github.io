# Sambath HUL Portfolio

Static-exported Next.js portfolio site plus a predictor UI and a small separate OAuth server under `server/`.

## Scripts

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
```

`predev` and `prebuild` automatically refresh the trip-image manifest and `llms.txt` outputs.

## Active app paths

- `app/` contains the live Next.js routes.
- `src/App.tsx` contains the main portfolio page rendered by `app/page.tsx`.
- `src/content/site.js` is the single source of portfolio content.
- `public/` holds static assets, deep-link pages, and generated `llms*.txt`.

## Notes

- Production output is static export in `out/`.
- `dist/` and `out/` are generated artifacts and should not be edited.
- Vitest remains the test runner even though the legacy Vite app path has been removed.
