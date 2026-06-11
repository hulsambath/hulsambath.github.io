# Security Hardening Design — my-portfolio

**Date:** 2026-06-11
**Scope:** Express OAuth backend (`server/`) + static Next.js site (GitHub Pages)
**Status:** Approved (dual-format token encryption variant)

## Context

The portfolio frontend is a static Next.js export (`output: "export"`) deployed to
GitHub Pages (`hulsambath.github.io`). Network-level DDoS against the site itself is
absorbed by GitHub's CDN; no application code can or needs to handle that. The real
attack surface is the Express OAuth backend (`server/`, deployed to Railway), which
brokers Google OAuth for the NoteMyMinds mobile app.

### Gaps found in the current server

1. `trust proxy` is never set. Behind Railway's proxy, `express-rate-limit` either
   buckets all clients under the proxy IP or can be bypassed via spoofed
   `X-Forwarded-For`.
2. `validateState()` only checks string length > 10 — no real CSRF protection.
   State is generated with `Math.random()` (predictable).
3. `ENCRYPTION_KEY` silently falls back to a hardcoded default. Encryption is
   AES-256-CBC with no integrity — ciphertexts are tamperable undetected.
4. Error responses include `error.message` (internal detail leak).
5. No body size limits; no server timeouts (slowloris exposure).
6. Rate limiting covers only `/auth`; root endpoint unlimited; expensive
   endpoints (`/auth/refresh`, `/auth/callback`) share the loose bucket.
7. The deprecated `crypto` npm placeholder package is listed as a dependency.

## Design

### 1. Request-abuse hardening (`server/server.js`)

- `app.set('trust proxy', 1)` — trust exactly one proxy hop (Railway).
- Three rate-limit tiers (all with `standardHeaders: true`, `legacyHeaders: false`):
  - Global: 300 requests / 15 min / IP on all routes.
  - `/auth`: keep 100 / 15 min / IP.
  - `/auth/refresh` and `/auth/callback`: 20 / 15 min / IP (these call Google's API).
- `express.json({ limit: '10kb' })`, `express.urlencoded({ extended: true, limit: '10kb' })`.
- HTTP server timeouts: `requestTimeout` 30s, `headersTimeout` 20s (must be less than requestTimeout),
  `keepAliveTimeout` 10s.
- `app.disable('x-powered-by')` (explicit, in addition to helmet).

### 2. Auth logic hardening (`server/middleware/auth.js`, `server/config/oauth.js`, `server/routes/auth.js`)

- **Stateless HMAC state (CSRF):**
  `state = <timestamp>.<nonce>.<HMAC-SHA256(timestamp + "." + nonce, ENCRYPTION_KEY)>`
  - Nonce: `crypto.randomBytes(16)` hex.
  - `validateState()` recomputes the HMAC with `crypto.timingSafeEqual` and rejects
    states older than 10 minutes.
  - No Redis/session store needed; survives restarts.
- **Fail-fast key check:** at startup, if `NODE_ENV === 'production'` and
  `ENCRYPTION_KEY` is missing or < 32 chars, log a clear error and `process.exit(1)`.
  The hardcoded default fallback is removed.
- **AES-256-GCM, dual-format:**
  - `encrypt()` emits `v2:<iv>:<authTag>:<ciphertext>` (hex parts) using AES-256-GCM.
  - `decrypt()` accepts both `v2:` GCM format and the legacy `iv:ciphertext` CBC
    format, so refresh tokens already stored on devices keep working.
  - The NoteMyMinds mobile app must add v2 decryption before this server deploys;
    legacy decrypt support stays until the app fleet has migrated.
- **Sanitized errors:** client responses carry only generic messages
  (e.g. `"Failed to complete authentication"`). `error.message` / stack go to
  server logs only. Applies to route handlers and the global error handler
  (the existing `NODE_ENV === 'development'` stack exposure is also removed from
  production paths).
- Remove `crypto` from `server/package.json` dependencies (Node built-in is used).

### 3. Static site (`app/layout.tsx`)

GitHub Pages cannot set custom HTTP headers, so protections use `<meta>` tags:

- CSP meta tag: `default-src 'self'`; allow the script/style/img/font sources the
  site actually uses (audit at implementation time — Tailwind inline styles need
  `'unsafe-inline'` for style-src); `object-src 'none'`; `base-uri 'self'`;
  `form-action 'self'`. Note: `frame-ancestors` is ignored in meta CSP — document
  this limitation.
- `<meta name="referrer" content="strict-origin-when-cross-origin">`.
- New doc `docs/security.md`: what GitHub Pages covers (CDN-level DDoS), what it
  can't (custom headers, WAF), and where the real controls live (the Express server).

## Out of scope

- Cloudflare / custom-domain WAF setup (user chose code-only hardening).
- Any change to the NoteMyMinds mobile app itself (separate repo/project).
- Authentication redesign (e.g. PKCE) — the OAuth flow shape stays as-is.

## Testing

Manual verification against a locally running server:

1. `RateLimit-*` headers present; exceeding the strict bucket on `/auth/refresh`
   returns 429.
2. Body > 10kb to `/auth/refresh` returns 413.
3. Forged, malformed, and expired (>10 min) `state` values are rejected on
   `/auth/callback`.
4. A legacy CBC-format token still decrypts via `/auth/refresh`; a v2 GCM token
   round-trips through `encrypt()`/`decrypt()`.
5. Tampering with a v2 ciphertext byte causes decryption failure (GCM auth).
6. Error responses contain no `details` field or stack traces.
7. Server in production mode without `ENCRYPTION_KEY` exits with a clear error.
8. `npm run build` (static export) succeeds and the CSP meta tag is present in
   the exported HTML without breaking page rendering.
