# Architecture & Tech Stack

## Tech stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, `app/`) |
| UI library | **React 19** + React DOM 19 |
| Language | **TypeScript 6** + TSX (`app/`, `src/App.tsx`) |
| Styling | **Tailwind CSS 3.4** + `@tailwindcss/typography`, PostCSS, autoprefixer |
| UI primitives | **shadcn/ui** (style: `new-york`) over `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge` |
| Icons | `lucide-react` |
| Theming | `next-themes` (system / light / dark, `attribute="class"`) |
| Linting | ESLint 9 (flat config) + react-hooks + react-refresh plugins |
| Output | Static export (`output: "export"`) → `out/` |

## Current app structure

This repo is now a single active **Next.js** application path:

- `app/` owns routing and layout.
- `app/page.tsx` renders the home portfolio page from `src/App.tsx`.
- `src/content/site.js` remains the single source of portfolio content.
- `package.json` still exposes `start`, but production uses **static export**,
  so `next start` is not part of the deployed path.
- The `@/*` alias is defined through `tsconfig.json`.

## Directory map

```
my-portfolio/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout: ThemeProvider + AutoScrollDemo, metadata
│   ├── page.tsx              # "/" → renders src/App.tsx
│   ├── globals.css           # Tailwind layer + design tokens
│   ├── auto-scroll-demo.tsx  # Optional auto-scroll wrapper (query-param driven)
│   └── kp-trip/              # "/kp-trip" standalone trip guide
│       ├── layout.tsx
│       └── page.tsx
├── src/
│   ├── App.tsx               # The entire portfolio home page (all sections)
│   ├── content/site.js       # ★ Single source of all portfolio content
│   └── assets/               # Logos + trip images (source)
├── components/
│   ├── theme-provider.tsx
│   └── ui/                   # shadcn/ui: button, card, badge, input
├── lib/utils.ts              # cn() helper (clsx + tailwind-merge)
├── public/                   # Static assets, CV PDF, deep-link pages, trip images
├── server/                   # Standalone NoteMyMinds OAuth backend (see oauth-server.md)
├── out/                      # Static export output (generated)
├── dist/                     # Generated artifact from older builds; not an app path
├── setup_kp_trip_images.mjs  # Pre-build: copies src/assets trip images → public/trip-images
├── next.config.js            # output: "export", images.unoptimized, strict mode
├── tailwind.config.js
├── components.json           # shadcn/ui config
└── .github/workflows/deploy.yml
```

## Root layout behaviour (`app/layout.tsx`)
- Sets page `<title>` / description metadata.
- Wraps everything in `ThemeProvider` (`next-themes`, system default).
- Wraps children in `AutoScrollDemo` — a utility that auto-scrolls the page when
  the URL has `?autoscroll=1` / `?demo=scroll` (used for recording demos), with
  optional `speed` and `loop` query params. No effect on normal visits.
