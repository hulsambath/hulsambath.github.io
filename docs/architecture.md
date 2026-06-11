# Architecture & Tech Stack

## Tech stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, `app/`) |
| UI library | **React 19** + React DOM 19 |
| Language | **TypeScript 6** (config + `app/`), with the main UI in **JSX** (`src/App.jsx`) |
| Secondary bundler | **Vite 7** (legacy entry point — see below) |
| Styling | **Tailwind CSS 3.4** + `@tailwindcss/typography`, PostCSS, autoprefixer |
| UI primitives | **shadcn/ui** (style: `new-york`) over `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge` |
| Icons | `lucide-react` |
| Theming | `next-themes` (system / light / dark, `attribute="class"`) |
| Linting | ESLint 9 (flat config) + react-hooks + react-refresh plugins |
| Output | Static export (`output: "export"`) → `out/` |

## The Next.js + Vite hybrid (important)

This repo is **transitional**. It was originally a Vite + React SPA and was
wrapped in Next.js without removing the old setup. As a result there are two
overlapping toolchains:

- **Next.js (primary)** — `app/` App Router. `app/page.tsx` is a thin client
  component that simply renders the old SPA:

  ```tsx
  "use client";
  import App from "../src/App.jsx";
  export default function Page() { return <App />; }
  ```

- **Vite (legacy/secondary)** — `index.html`, `src/main.jsx`, `vite.config.ts`.
  Reachable via `npm run dev:vite` / `npm run build:vite` but **not** used for
  the deployed build.

### Practical implications
- The real portfolio markup lives in **`src/App.jsx`**, not in `app/`.
- TypeScript is installed and configured, but the main component is plain JSX.
- `package.json` exposes a `start` script (`next start`), but deployment uses a
  **static export**, so `next start` is not part of the production path.
- Two path aliases exist: `@/*` → repo root (tsconfig + vite.config).

## Directory map

```
my-portfolio/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout: ThemeProvider + AutoScrollDemo, metadata
│   ├── page.tsx              # "/" → renders src/App.jsx
│   ├── globals.css           # Tailwind layer + design tokens
│   ├── auto-scroll-demo.tsx  # Optional auto-scroll wrapper (query-param driven)
│   └── kp-trip/              # "/kp-trip" standalone trip guide
│       ├── layout.tsx
│       └── page.tsx
├── src/                      # Legacy Vite SPA — still the source of the UI
│   ├── App.jsx               # The entire portfolio page (all sections)
│   ├── main.jsx              # Vite entry (legacy)
│   ├── content/site.js       # ★ Single source of all portfolio content
│   └── assets/               # Logos + trip images (source)
├── components/
│   ├── theme-provider.tsx
│   └── ui/                   # shadcn/ui: button, card, badge, input
├── lib/utils.ts              # cn() helper (clsx + tailwind-merge)
├── public/                   # Static assets, CV PDF, deep-link pages, trip images
├── server/                   # Standalone NoteMyMinds OAuth backend (see oauth-server.md)
├── out/                      # Static export output (generated)
├── dist/                     # Vite build output (generated, legacy)
├── setup_kp_trip_images.mjs  # Pre-build: copies src/assets trip images → public/trip-images
├── next.config.js            # output: "export", images.unoptimized, strict mode
├── vite.config.ts            # Legacy Vite config
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
