# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the Express OAuth backend (`server/`) against abuse/DDoS and token tampering, and add the best available client-side protections to the static GitHub Pages site.

**Architecture:** The backend gets stateless HMAC-signed CSRF state, AES-256-GCM token encryption (dual-format: legacy CBC still decrypts), correct proxy-aware rate limiting in three tiers, body/timeout limits, and sanitized error responses. The static site gets a CSP `<meta>` tag and referrer policy in the Next.js root layout (GitHub Pages cannot set HTTP headers).

**Tech Stack:** Express 4, express-rate-limit 7, helmet 7, Node built-in `crypto` and `node:test`, Next.js 16 app router.

**Spec:** `docs/superpowers/specs/2026-06-11-security-hardening-design.md`

**Working directory:** All `server/` commands run from `/Users/apple/Documents/project/my-portfolio/server`. Task 6 runs from `/Users/apple/Documents/project/my-portfolio`.

---

### Task 1: HMAC-signed CSRF state (TDD)

**Files:**
- Modify: `server/package.json` (add test script)
- Create: `server/test/auth.test.js`
- Modify: `server/middleware/auth.js`

- [x] **Step 1: Add test script to server/package.json**

In `server/package.json`, add to `"scripts"`:

```json
"test": "node --test test/"
```

- [x] **Step 2: Write failing tests for state generation/validation**

Create `server/test/auth.test.js`:

```js
import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";

// Must be set BEFORE the module under test is imported
process.env.ENCRYPTION_KEY = "test-key-0123456789abcdef0123456789abcdef";

const { generateState, validateState } = await import("../middleware/auth.js");

const SECRET = process.env.ENCRYPTION_KEY;

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

test("generateState produces a state that validateState accepts", () => {
  const state = generateState();
  assert.equal(validateState(state), true);
});

test("state has timestamp.nonce.hmac structure", () => {
  const parts = generateState().split(".");
  assert.equal(parts.length, 3);
  assert.ok(Number(parts[0]) > 0);
  assert.equal(parts[1].length, 32); // 16 random bytes as hex
  assert.equal(parts[2].length, 64); // sha256 hex
});

test("tampered state is rejected", () => {
  const state = generateState();
  const [ts, nonce, sig] = state.split(".");
  const otherNonce = crypto.randomBytes(16).toString("hex");
  assert.equal(validateState(`${ts}.${otherNonce}.${sig}`), false);
});

test("expired state is rejected even with a valid signature", () => {
  const ts = (Date.now() - 11 * 60 * 1000).toString(); // 11 min old, TTL is 10
  const nonce = crypto.randomBytes(16).toString("hex");
  const expired = `${ts}.${nonce}.${sign(`${ts}.${nonce}`)}`;
  assert.equal(validateState(expired), false);
});

test("future-dated state is rejected", () => {
  const ts = (Date.now() + 60 * 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const future = `${ts}.${nonce}.${sign(`${ts}.${nonce}`)}`;
  assert.equal(validateState(future), false);
});

test("malformed states are rejected", () => {
  assert.equal(validateState(undefined), false);
  assert.equal(validateState(null), false);
  assert.equal(validateState(""), false);
  assert.equal(validateState("longer-than-ten-chars-but-junk"), false);
  assert.equal(validateState("a.b.c"), false);
});
```

- [x] **Step 3: Run tests to verify they fail**

Run from `server/`: `npm test`
Expected: FAIL — `generateState` is not exported by `../middleware/auth.js`.

- [x] **Step 4: Implement state functions in middleware/auth.js**

Replace the `validateState` function at the bottom of `server/middleware/auth.js` (and add `generateState`). Keep the existing `encrypt`/`decrypt` untouched for now (Task 2 replaces them). Add at top-level (after the existing `ENCRYPTION_KEY` constant):

```js
const STATE_TTL_MS = 10 * 60 * 1000;

function signState(payload) {
  return crypto.createHmac("sha256", ENCRYPTION_KEY).update(payload).digest("hex");
}

/**
 * Generate HMAC-signed OAuth state for CSRF protection.
 * Format: <timestamp>.<nonce>.<hmac>
 */
export function generateState() {
  const ts = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  return `${ts}.${nonce}.${signState(`${ts}.${nonce}`)}`;
}

/**
 * Validate OAuth state: structure, HMAC signature (timing-safe), and age.
 */
export function validateState(state) {
  if (typeof state !== "string") return false;
  const parts = state.split(".");
  if (parts.length !== 3) return false;
  const [ts, nonce, sig] = parts;

  let sigBuf;
  try {
    sigBuf = Buffer.from(sig, "hex");
  } catch {
    return false;
  }
  const expectedBuf = Buffer.from(signState(`${ts}.${nonce}`), "hex");
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  const age = Date.now() - Number(ts);
  return Number.isFinite(age) && age >= 0 && age <= STATE_TTL_MS;
}
```

Delete the old `validateState` (the one that only checks `state.length > 10`).

- [x] **Step 5: Run tests to verify they pass**

Run from `server/`: `npm test`
Expected: PASS (6 tests).

- [x] **Step 6: Commit**

```bash
git add server/package.json server/test/auth.test.js server/middleware/auth.js
git commit -m "feat(server): HMAC-signed OAuth state with TTL for real CSRF protection"
```

---

### Task 2: AES-256-GCM token encryption with legacy CBC decrypt (TDD)

**Files:**
- Modify: `server/test/auth.test.js`
- Modify: `server/middleware/auth.js`

- [x] **Step 1: Write failing tests for v2 encryption**

Append to `server/test/auth.test.js` (also add `encrypt`/`decrypt` to the existing dynamic import line):

```js
// change the import line to:
const { generateState, validateState, encrypt, decrypt } = await import(
  "../middleware/auth.js"
);
```

```js
test("encrypt emits v2 GCM format and decrypt round-trips it", () => {
  const out = encrypt("hello tokens");
  assert.ok(out.startsWith("v2:"));
  assert.equal(out.split(":").length, 4); // v2:iv:tag:ciphertext
  assert.equal(decrypt(out), "hello tokens");
});

test("tampered v2 ciphertext fails to decrypt", () => {
  const out = encrypt("hello tokens");
  const parts = out.split(":");
  const ct = parts[3];
  const flipped = (ct[0] === "0" ? "1" : "0") + ct.slice(1);
  const tampered = `${parts[0]}:${parts[1]}:${parts[2]}:${flipped}`;
  assert.throws(() => decrypt(tampered));
});

test("legacy CBC tokens still decrypt", () => {
  // Reproduce the legacy encrypt: AES-256-CBC, key padded to 32 bytes
  const key = Buffer.from(SECRET.padEnd(32, "0").slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let enc = cipher.update("legacy data", "utf8", "hex");
  enc += cipher.final("hex");
  const legacy = iv.toString("hex") + ":" + enc;
  assert.equal(decrypt(legacy), "legacy data");
});
```

- [x] **Step 2: Run tests to verify the new ones fail**

Run from `server/`: `npm test`
Expected: the three new tests FAIL (current `encrypt` emits CBC `iv:ciphertext`, no `v2:` prefix); the 6 state tests still PASS.

- [x] **Step 3: Replace encrypt/decrypt in middleware/auth.js**

Replace the existing `encrypt` and `decrypt` functions with:

```js
// Must match the legacy CBC key derivation so old tokens still decrypt
function deriveKey() {
  return Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));
}

/**
 * Encrypt sensitive data (AES-256-GCM, authenticated).
 * Format: v2:<iv>:<authTag>:<ciphertext> (hex)
 */
export function encrypt(text) {
  const key = deriveKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `v2:${iv.toString("hex")}:${tag}:${encrypted}`;
}

/**
 * Decrypt data. Accepts v2 (GCM) and legacy (CBC iv:ciphertext) formats —
 * legacy support keeps refresh tokens already stored on devices working.
 */
export function decrypt(text) {
  const key = deriveKey();

  if (text.startsWith("v2:")) {
    const [, ivHex, tagHex, data] = text.split(":");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    let decrypted = decipher.update(data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  // Legacy AES-256-CBC: <iv>:<ciphertext>
  const parts = text.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(parts.join(":"), "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

Remove the old `const ALGORITHM = 'aes-256-cbc';` line and the duplicated key-derivation code inside the old functions.

- [x] **Step 4: Run tests to verify all pass**

Run from `server/`: `npm test`
Expected: PASS (9 tests).

- [x] **Step 5: Commit**

```bash
git add server/test/auth.test.js server/middleware/auth.js
git commit -m "feat(server): AES-256-GCM token encryption with legacy CBC decrypt support"
```

---

### Task 3: Fail-fast ENCRYPTION_KEY check + drop bogus crypto dependency

**Files:**
- Modify: `server/middleware/auth.js`
- Modify: `server/package.json`

- [x] **Step 1: Replace the key constant with fail-fast logic**

In `server/middleware/auth.js`, replace:

```js
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
```

with:

```js
const ENCRYPTION_KEY = (() => {
  const key = process.env.ENCRYPTION_KEY;
  if (process.env.NODE_ENV === "production") {
    if (!key || key.length < 32) {
      console.error(
        "FATAL: ENCRYPTION_KEY must be set and at least 32 characters in production.",
      );
      process.exit(1);
    }
    return key;
  }
  if (!key) {
    console.warn(
      "WARNING: ENCRYPTION_KEY not set — using an insecure development-only key.",
    );
    return "dev-only-insecure-key-do-not-use";
  }
  return key;
})();
```

- [x] **Step 2: Verify fail-fast behavior and that tests still pass**

Run from `server/`:

```bash
NODE_ENV=production node -e "import('./middleware/auth.js')" ; echo "exit: $?"
npm test
```

Expected: first command prints the FATAL message and `exit: 1`; `npm test` still PASSes (test file sets `ENCRYPTION_KEY` before import).

- [x] **Step 3: Remove the deprecated crypto npm package**

In `server/package.json` dependencies, delete the line `"crypto": "^1.0.1",` then run from `server/`:

```bash
npm install
npm test
```

Expected: install succeeds, tests still PASS (the code uses Node's built-in `crypto`).

- [x] **Step 4: Commit**

```bash
git add server/middleware/auth.js server/package.json server/package-lock.json
git commit -m "feat(server): fail fast on missing ENCRYPTION_KEY; drop bogus crypto npm package"
```

---

### Task 4: Use signed state in the OAuth URL + sanitize route errors

**Files:**
- Modify: `server/config/oauth.js`
- Modify: `server/routes/auth.js`

- [x] **Step 1: Wire generateState into config/oauth.js**

In `server/config/oauth.js`:

1. Add import: `import { generateState } from '../middleware/auth.js';`
2. Delete the local `generateState()` function (the `Math.random()` one) at the bottom of the file.

The existing call `state: generateState()` inside `generateAuthUrl()` now uses the HMAC version.

- [x] **Step 2: Remove error detail leaks in routes/auth.js**

In `server/routes/auth.js`:

In the `/callback` catch block, replace:

```js
    res.status(500).json({
      error: "Failed to complete authentication",
      details: error.message,
    });
```

with:

```js
    res.status(500).json({ error: "Failed to complete authentication" });
```

In the `/refresh` catch block, replace:

```js
    res.status(401).json({
      error: "Failed to refresh token",
      details: error.message,
    });
```

with:

```js
    res.status(401).json({ error: "Failed to refresh token" });
```

(The `console.error` logging above each stays — details remain in server logs.)

- [x] **Step 3: Verify the server boots and the auth URL carries the new state**

Run from `server/`:

```bash
npm test
node -e "
process.env.GOOGLE_CLIENT_ID='x'; process.env.GOOGLE_CLIENT_SECRET='y'; process.env.REDIRECT_URI='http://localhost/cb';
const { generateAuthUrl } = await import('./config/oauth.js');
const url = new URL(generateAuthUrl());
const state = url.searchParams.get('state');
console.log('state parts:', state.split('.').length);
"
```

Expected: tests PASS; the script prints `state parts: 3`.

- [x] **Step 4: Commit**

```bash
git add server/config/oauth.js server/routes/auth.js
git commit -m "feat(server): crypto-random signed OAuth state; stop leaking error details to clients"
```

---

### Task 5: server.js hardening — trust proxy, rate-limit tiers, body limits, timeouts

**Files:**
- Modify: `server/server.js`

- [x] **Step 1: Apply the hardening edits**

In `server/server.js`:

1. After `const app = express();` add:

```js
// Railway terminates TLS at a single proxy hop; trust exactly one hop so
// express-rate-limit sees the real client IP but spoofed X-Forwarded-For
// chains from clients are not honored.
app.set("trust proxy", 1);
app.disable("x-powered-by");
```

2. Replace the existing rate-limit block:

```js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/auth', limiter);
```

with:

```js
const limiterDefaults = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
};

// Tier 1: everything, including the root endpoint
app.use(rateLimit({ ...limiterDefaults, max: 300 }));

// Tier 2: auth surface
app.use("/auth", rateLimit({ ...limiterDefaults, max: 100 }));

// Tier 3: endpoints that call Google's API
app.use(
  ["/auth/refresh", "/auth/callback"],
  rateLimit({ ...limiterDefaults, max: 20 }),
);
```

3. Replace the body parsers:

```js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

with:

```js
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
```

4. In the global error handler, replace:

```js
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

with:

```js
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ error: "Internal server error" });
});
```

5. Capture the server instance and set timeouts. Change `app.listen(PORT, () => {` to `const server = app.listen(PORT, () => {` and add after the closing `});` of the listen callback:

```js
// Bound slow/idle connections (slowloris mitigation)
server.requestTimeout = 30_000;
server.headersTimeout = 35_000;
server.keepAliveTimeout = 10_000;
```

- [x] **Step 2: Verify against a running server**

Run from `server/` (first command in background or a second terminal):

```bash
ENCRYPTION_KEY=test-key-0123456789abcdef0123456789abcdef node server.js &
sleep 1
curl -s -D - -o /dev/null http://localhost:3000/ | grep -i "ratelimit\|x-powered-by"
node -e "console.log('x'.repeat(20000))" | curl -s -o - -w "%{http_code}\n" -X POST http://localhost:3000/auth/refresh -H 'Content-Type: application/json' -d @- | tail -1
kill %1
```

Expected: `RateLimit-Policy` / `RateLimit` headers present, **no** `X-Powered-By` header; the oversized POST returns `413`.

- [x] **Step 3: Commit**

```bash
git add server/server.js
git commit -m "feat(server): trust proxy, tiered rate limits, body size limits, connection timeouts"
```

---

### Task 6: Static site — CSP meta tag, referrer policy, security doc

**Files:**
- Modify: `app/layout.tsx`
- Create: `docs/security.md`

- [x] **Step 1: Add CSP and referrer policy to the root layout**

Replace `app/layout.tsx` content with:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProvider } from "../components/theme-provider";
import { AutoScrollDemo } from "./auto-scroll-demo";
import "./globals.css";

// GitHub Pages cannot set HTTP response headers, so CSP ships as a meta tag.
// Note: frame-ancestors is ignored in meta CSP — clickjacking protection is
// not available on GitHub Pages (see docs/security.md).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://plausible.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self' https://plausible.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export const metadata: Metadata = {
  title: "Sambath HUL - Software Engineer | Mobile, Web & Developer Tooling",
  description:
    "Sambath HUL is a Software Engineer specializing in cross-platform mobile apps (Flutter), web development (React/Next.js), and developer tooling.",
  referrer: "strict-origin-when-cross-origin",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AutoScrollDemo>{children}</AutoScrollDemo>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [x] **Step 2: Write docs/security.md**

Create `docs/security.md`:

```markdown
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
```

- [x] **Step 3: Build and verify the export**

Run from the repo root:

```bash
npm run build
grep -o "Content-Security-Policy" out/index.html
grep -o 'name="referrer"' out/index.html
```

Expected: build succeeds; both greps print a match.

- [x] **Step 4: Spot-check rendering**

Run: `npx serve out` (or `python3 -m http.server -d out 8080`) and open the page; confirm fonts load and no CSP violations appear in the browser console. Stop the server.

- [x] **Step 5: Commit**

```bash
git add app/layout.tsx docs/security.md
git commit -m "feat(site): CSP meta tag, referrer policy, security posture doc"
```

---

### Task 7: End-to-end verification of the server

**Files:** none (verification only)

- [x] **Step 1: Full test suite**

Run from `server/`: `npm test`
Expected: 9 tests PASS.

- [x] **Step 2: Forged state + error-leak checks (run BEFORE the rate-limit loop, which exhausts the bucket)**

Run from `server/`:

```bash
ENCRYPTION_KEY=test-key-0123456789abcdef0123456789abcdef node server.js &
sleep 1
# Forged state rejected on callback
curl -s "http://localhost:3000/auth/callback?code=x&state=forged-state-value" | head -c 200; echo
# No error-detail leak on a failing refresh
curl -s -X POST http://localhost:3000/auth/refresh -H 'Content-Type: application/json' -d '{"refresh_token":"garbage"}'; echo
```

Expected: callback responds `{"error":"Invalid state parameter"}`; refresh responds `{"error":"Failed to refresh token"}` with no `details` field.

- [x] **Step 3: Strict rate limit on /auth/refresh**

```bash
# 2 requests already consumed above (callback + refresh share the 20/15min bucket
# only for refresh+callback paths, so 2 used). 19 more → the 21st total returns 429.
for i in $(seq 1 19); do
  curl -s -o /dev/null -w "%{http_code} " -X POST http://localhost:3000/auth/refresh \
    -H 'Content-Type: application/json' -d '{}'
done; echo
kill %1
```

Expected: eighteen `400` followed by a final `429` (bucket of 20 exhausted by the 2 earlier requests plus these 19).

- [x] **Step 4: Final commit (plan checkboxes + any doc touch-ups)**

```bash
git add docs/superpowers/plans/2026-06-11-security-hardening.md
git commit -m "docs: mark security hardening plan complete"
```
