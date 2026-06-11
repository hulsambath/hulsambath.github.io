# `server/` — NoteMyMinds OAuth Backend

A **standalone Express service** that lives in this repo but is **not part of
the portfolio website**. It is the Google OAuth broker for the *NoteMyMinds*
mobile app. Package name: `portfolio-oauth-backend`.

> It only relates to the portfolio because it reuses the GitHub Pages domain
> (`hulsambath.github.io`) as an OAuth redirect/universal-link target.

## Why it exists

Mobile apps can't safely embed a Google client secret. This server holds the
secret and brokers the OAuth code-for-token exchange, enabling all NoteMyMinds
platforms (iOS, Android, Web, Desktop) to share one OAuth flow and reach the
same Google Drive `appDataFolder`.

```
Mobile App → Browser → OAuth Server → Google OAuth → OAuth Server → Mobile App
                                                            ↓
                                              Encrypted token via deep link
```

## Stack

Express 4 · `googleapis` · `cors` · `helmet` · `express-rate-limit` ·
`dotenv` · `crypto`. ES modules. Run with `node server.js` (`npm start`) or
`npm run dev` (`node --watch`).

## Endpoints (`routes/auth.js`, mounted at `/auth`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Service info / endpoint list (root, in `server.js`) |
| GET | `/auth/google` | Redirects to the Google consent screen |
| GET | `/auth/callback` | Exchanges `code` for tokens, encrypts them, redirects to the app via deep link; serves an "Authentication Successful" HTML page |
| POST | `/auth/refresh` | Exchanges a refresh token for a new access token |
| GET | `/auth/status` | Health check |

### Callback redirect strategy
After exchanging the code, tokens are JSON-encoded and **encrypted**, then handed
to the app two ways:
- **Primary (universal link):** `https://hulsambath.github.io/auth?token=...`
- **Fallback (custom scheme):** `${MOBILE_CALLBACK_SCHEME}?token=...`

The success page auto-attempts the custom scheme via JS and shows manual buttons
if the app doesn't open.

## Security (`server.js`, `middleware/auth.js`, `config/oauth.js`)
- `helmet` security headers.
- **CORS allowlist** — defaults to `http://localhost:5173` and
  `https://hulsambath.github.io` (overridable via `ALLOWED_ORIGINS`); requests
  with no origin (mobile/Postman) are allowed.
- **Rate limiting** — 100 requests / 15 min on `/auth`.
- **CSRF** — `state` parameter validation on the callback.
- **Token encryption** — AES via `ENCRYPTION_KEY` before tokens leave the server
  (`encrypt`/`decrypt` in `middleware/auth.js`).

## Configuration (`.env`)

Documented in `server/.env.example` and `server/ENV_VALUES.md`. Keys:

| Var | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `PORT` / `NODE_ENV` | Server config |
| `REDIRECT_URI` | OAuth redirect (must match Google console) |
| `MOBILE_CALLBACK_SCHEME` | App custom-scheme deep link |
| `ALLOWED_ORIGINS` | CORS allowlist (comma-separated) |
| `ENCRYPTION_KEY` | AES key for token encryption |
| `API_BASE_URL` | Public server URL once deployed |

> **Secrets:** `server/.env` exists locally with real values but **is
> gitignored** (verified) — it is not committed. Never commit it. Deployment
> details are in `server/DEPLOYMENT.md`.

## Deployment
Separate from the portfolio (the portfolio is a static export with no server).
See `server/DEPLOYMENT.md` for the hosting target and steps.
