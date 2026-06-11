# Security Posture

## Static site (GitHub Pages — hulsambath.github.io)

- **DDoS:** absorbed by GitHub's CDN (Fastly). Nothing in this repo handles or
  needs to handle volumetric attacks.
- **HTTP headers:** GitHub Pages does not support custom response headers, so
  CSP and referrer policy ship as `<meta>` tags in `app/layout.tsx`.
  Limitations of meta-CSP: `frame-ancestors` (clickjacking) and report-uri are
  ignored by browsers in meta tags. For real header control / WAF / bot rules,
  the site would need a custom domain behind Cloudflare or similar.
- **CSP allowlist:** Google Fonts (styles + fonts), plausible.io (analytics),
  everything else self-only. Update `csp` in `app/layout.tsx` when adding
  external resources.
- **`'unsafe-inline'` in script-src:** required by Next.js static export
  (hydration payloads and the next-themes script are inline, and no server
  exists to inject nonces). This means the CSP does not protect against
  script injection (XSS); its value here is in the non-script directives
  (`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and the
  source allowlists).

## OAuth backend (`server/`, deployed on Railway)

- `trust proxy = 1`: rate limiting keys on the real client IP; spoofed
  `X-Forwarded-For` chains are not honored.
- Rate limits: 300 req/15 min global, 100 req/15 min on `/auth`,
  20 req/15 min on `/auth/refresh` + `/auth/callback`.
- Bodies capped at 10 kb; connection timeouts bound slowloris-style attacks.
- OAuth `state` is `timestamp.nonce.HMAC-SHA256` with a 10-minute TTL,
  validated with a timing-safe compare.
- Tokens are encrypted with AES-256-GCM (`v2:` prefix). Legacy AES-CBC tokens
  still decrypt so previously logged-in devices keep working — remove the CBC
  branch in `server/middleware/auth.js` once the NoteMyMinds app fleet has
  migrated to v2 decryption.
- The server refuses to start in production without a >= 32-char
  `ENCRYPTION_KEY`.
- Error responses are generic; details stay in server logs.
