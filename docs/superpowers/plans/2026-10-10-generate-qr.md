# QR Code Generator (`/generate-qr`) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a personal, fully client-side QR code generator at `/generate-qr`: pick a content type (URL, text, Wi‑Fi, email), tune style (error correction, size, margin, colours), preview live, and download PNG/SVG or copy the PNG to the clipboard.

**Architecture:** A new App Router segment `app/generate-qr/` in the static-export site. Pure, unit-tested logic lives in small TS modules (`payload.ts` builds the encoded string, `colors.ts` checks scannability, `render.ts` wraps the `qrcode` library, `download.ts` handles filenames and data-URL→Blob). Thin `"use client"` components compose them. Nothing is sent over the network — encoding happens in the browser, so it works under the existing GitHub Pages CSP and offline.

**Tech Stack:** Next.js 16 (App Router, `output: "export"`), React 19, TypeScript, Tailwind 3 + the existing `components/ui` primitives (`Button`, `Card`, `Input`, `Badge`), `lucide-react` icons, `qrcode` (new dependency), vitest (node environment).

**Spec:** This plan is self-contained — the design decisions are in "Design Decisions" below (no separate spec file).

## Design Decisions

- **Route:** `/generate-qr` → `app/generate-qr/page.tsx` + `app/generate-qr/layout.tsx` (metadata). Exported statically as `out/generate-qr/index.html` like `/kp-trip`.
- **Audience:** it's a personal tool. It is **not** linked from the portfolio nav, **not** added to `public/sitemap.xml`, and sets `robots: { index: false, follow: false }`. (Easy to flip later.)
- **Content types (v1):** `url`, `text`, `wifi`, `email`. No vCard/SMS/geo (YAGNI — add later as new `kind`s in `payload.ts`).
- **Options:** error correction `L|M|Q|H` (default `M`), size 128–2048 px (default 512), quiet-zone margin 0–10 modules (default 4), foreground/background hex colours (default `#000000` / `#ffffff`).
- **Outputs:** Download PNG, Download SVG, Copy PNG to clipboard (only shown when the browser supports `ClipboardItem`).
- **Library:** `qrcode@1.5.4` (+ `@types/qrcode@1.5.5`). Pure JS, no network, renders SVG strings and PNG data URLs in both node (tests) and browser.
- **Preview:** an `<img>` whose `src` is the SVG as a `data:image/svg+xml` URL — never `dangerouslySetInnerHTML`. CSP `img-src` already allows `data:`.

## Global Constraints

- Work only inside `my-portfolio/`. Branch `feat/generate-qr` off `develop` (current default working branch).
- Node is managed by asdf and no version is pinned in this repo — prefix commands with `ASDF_NODEJS_VERSION=24.9.0` (or export it once per shell). Do **not** create a `.tool-versions` file.
- Per-task gate: `npx vitest run` green and `npx tsc --noEmit` clean. Final task also `npm run build`. (`npm run lint` is known-broken in this repo — don't use it as a gate.)
- vitest only picks up `app/**/*.test.ts` in a **node** environment — tests must be `.ts` (not `.tsx`) and must not touch `window`/`document`.
- Do not edit `app/layout.tsx`'s CSP: nothing in this feature needs a new origin. In particular, **never `fetch()` a `data:` URL** — `connect-src` does not allow `data:` and the call fails in production.
- Do not hand-edit `public/llms*.txt` (generated) or anything in `out/`, `dist/`, `node_modules/`.
- Use theme tokens (`bg-background`, `text-muted-foreground`, `border-border`, `text-destructive`, …) — no hardcoded Tailwind palette colours in UI chrome. (The QR's own fg/bg colours are user data and are exempt.)
- Commits: Conventional Commits with the repo's scope, e.g. `feat(portfolio): …`, `docs(portfolio): …`.

## Review Focus

1. **Payload too large** for the chosen error-correction level (e.g. 3 000 chars at `H`) → a readable inline error and disabled download buttons, never a crash or a stale/blank preview. *(Task 3 test `too-long payload`.)*
2. **Wi‑Fi SSID/password with special characters** (`;`, `,`, `:`, `"`, `\`) → escaped per the `WIFI:` spec so phones join the right network. *(Task 1 test `escapes wifi specials`.)*
3. **Khmer / emoji / non-ASCII text** → encodes as UTF‑8 and renders without error. *(Task 3 test `encodes Khmer text`.)*
4. **Low-contrast or inverted colours** (light fg on dark bg) → a visible "may not scan" warning; still allowed. *(Task 2 tests.)*
5. **Copy to clipboard under CSP / unsupported browsers** → data URL is converted to a Blob without `fetch`; button hidden when `ClipboardItem` is unavailable. *(Task 4 test `dataUrlToBlob`.)*

---

### Task 1: Payload builder

**Files:**
- Create: `app/generate-qr/payload.ts`
- Test: `app/generate-qr/payload.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type QrKind = "url" | "text" | "wifi" | "email";
  export type WifiSecurity = "WPA" | "WEP" | "nopass";
  export type QrInput =
    | { kind: "url"; url: string }
    | { kind: "text"; text: string }
    | { kind: "wifi"; ssid: string; password: string; security: WifiSecurity; hidden: boolean }
    | { kind: "email"; to: string; subject: string; body: string };
  export function emptyInput(kind: QrKind): QrInput;
  export function buildPayload(input: QrInput): string; // "" means "nothing to encode yet"
  ```

- [ ] **Step 1: Create the branch**

```bash
cd my-portfolio
git switch develop && git pull --ff-only
git switch -c feat/generate-qr
```

- [ ] **Step 2: Write the failing test** — `app/generate-qr/payload.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { buildPayload, emptyInput } from "./payload";

describe("buildPayload", () => {
  it("url: adds https:// when no scheme is present", () => {
    expect(buildPayload({ kind: "url", url: "  hulsambath.me/kp-trip " })).toBe(
      "https://hulsambath.me/kp-trip",
    );
  });

  it("url: keeps an existing scheme", () => {
    expect(buildPayload({ kind: "url", url: "http://localhost:3000" })).toBe(
      "http://localhost:3000",
    );
    expect(buildPayload({ kind: "url", url: "tel:+85512345678" })).toBe("tel:+85512345678");
  });

  it("url: blank input encodes nothing", () => {
    expect(buildPayload({ kind: "url", url: "   " })).toBe("");
  });

  it("text: is passed through untouched (including whitespace and newlines)", () => {
    expect(buildPayload({ kind: "text", text: " line 1\nline 2 " })).toBe(" line 1\nline 2 ");
  });

  it("wifi: builds a WPA payload", () => {
    expect(
      buildPayload({ kind: "wifi", ssid: "Home", password: "secret", security: "WPA", hidden: false }),
    ).toBe("WIFI:T:WPA;S:Home;P:secret;;");
  });

  it("wifi: escapes wifi specials in ssid and password", () => {
    expect(
      buildPayload({ kind: "wifi", ssid: 'My;Net,"5G":\\', password: "a;b", security: "WPA", hidden: false }),
    ).toBe('WIFI:T:WPA;S:My\\;Net\\,\\"5G\\"\\:\\\\;P:a\\;b;;');
  });

  it("wifi: open network omits the password and marks hidden networks", () => {
    expect(
      buildPayload({ kind: "wifi", ssid: "Cafe", password: "ignored", security: "nopass", hidden: true }),
    ).toBe("WIFI:T:nopass;S:Cafe;H:true;;");
  });

  it("wifi: blank ssid encodes nothing", () => {
    expect(
      buildPayload({ kind: "wifi", ssid: "", password: "x", security: "WPA", hidden: false }),
    ).toBe("");
  });

  it("email: builds a mailto with encoded subject and body", () => {
    expect(
      buildPayload({ kind: "email", to: "me@example.com", subject: "Hi there", body: "a&b\nc" }),
    ).toBe("mailto:me@example.com?subject=Hi%20there&body=a%26b%0Ac");
  });

  it("email: omits empty query params; blank recipient encodes nothing", () => {
    expect(buildPayload({ kind: "email", to: "me@example.com", subject: "", body: "" })).toBe(
      "mailto:me@example.com",
    );
    expect(buildPayload({ kind: "email", to: " ", subject: "s", body: "" })).toBe("");
  });
});

describe("emptyInput", () => {
  it("returns a blank input of the requested kind", () => {
    expect(emptyInput("wifi")).toEqual({
      kind: "wifi",
      ssid: "",
      password: "",
      security: "WPA",
      hidden: false,
    });
    expect(buildPayload(emptyInput("url"))).toBe("");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `ASDF_NODEJS_VERSION=24.9.0 npx vitest run app/generate-qr/payload.test.ts`
Expected: FAIL — `Failed to resolve import "./payload"`.

- [ ] **Step 4: Write the implementation** — `app/generate-qr/payload.ts`

```ts
export type QrKind = "url" | "text" | "wifi" | "email";
export type WifiSecurity = "WPA" | "WEP" | "nopass";

export type QrInput =
  | { kind: "url"; url: string }
  | { kind: "text"; text: string }
  | { kind: "wifi"; ssid: string; password: string; security: WifiSecurity; hidden: boolean }
  | { kind: "email"; to: string; subject: string; body: string };

export function emptyInput(kind: QrKind): QrInput {
  switch (kind) {
    case "url":
      return { kind, url: "" };
    case "text":
      return { kind, text: "" };
    case "wifi":
      return { kind, ssid: "", password: "", security: "WPA", hidden: false };
    case "email":
      return { kind, to: "", subject: "", body: "" };
  }
}

// WIFI: payload format reserves \ ; , " : — each must be backslash-escaped.
function escapeWifi(value: string): string {
  return value.replace(/([\\;,":])/g, "\\$1");
}

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** The exact string to encode, or "" when there is nothing to encode yet. */
export function buildPayload(input: QrInput): string {
  switch (input.kind) {
    case "url": {
      const url = input.url.trim();
      if (!url) return "";
      return HAS_SCHEME.test(url) ? url : `https://${url}`;
    }
    case "text":
      return input.text.trim() ? input.text : "";
    case "wifi": {
      if (!input.ssid) return "";
      let out = `WIFI:T:${input.security};S:${escapeWifi(input.ssid)};`;
      if (input.security !== "nopass") out += `P:${escapeWifi(input.password)};`;
      if (input.hidden) out += "H:true;";
      return `${out};`;
    }
    case "email": {
      const to = input.to.trim();
      if (!to) return "";
      const params = [
        input.subject && `subject=${encodeURIComponent(input.subject)}`,
        input.body && `body=${encodeURIComponent(input.body)}`,
      ].filter(Boolean);
      return params.length ? `mailto:${to}?${params.join("&")}` : `mailto:${to}`;
    }
  }
}
```

Note: `HAS_SCHEME` would treat `localhost:3000` as scheme `localhost:` — acceptable for a personal tool; type `http://localhost:3000` explicitly.

- [ ] **Step 5: Run tests and typecheck**

Run: `ASDF_NODEJS_VERSION=24.9.0 npx vitest run app/generate-qr/payload.test.ts && ASDF_NODEJS_VERSION=24.9.0 npx tsc --noEmit`
Expected: all 11 tests PASS; tsc prints nothing.

- [ ] **Step 6: Commit**

```bash
git add app/generate-qr/payload.ts app/generate-qr/payload.test.ts
git commit -m "feat(portfolio): add QR payload builder for url, text, wifi and email"
```

---

### Task 2: Colour scannability check

**Files:**
- Create: `app/generate-qr/colors.ts`
- Test: `app/generate-qr/colors.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export function isHexColor(value: string): boolean;          // "#rgb" or "#rrggbb"
  export function contrastRatio(fg: string, bg: string): number; // WCAG, 1..21
  export type ColorWarning = "low-contrast" | "inverted" | null;
  export function colorWarning(fg: string, bg: string): ColorWarning;
  ```

- [ ] **Step 1: Write the failing test** — `app/generate-qr/colors.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { colorWarning, contrastRatio, isHexColor } from "./colors";

describe("isHexColor", () => {
  it("accepts #rgb and #rrggbb, rejects everything else", () => {
    expect(isHexColor("#fff")).toBe(true);
    expect(isHexColor("#FF6F00")).toBe(true);
    expect(isHexColor("fff")).toBe(false);
    expect(isHexColor("#ff6f0")).toBe(false);
    expect(isHexColor("red")).toBe(false);
  });
});

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for identical colours", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#abc", "#aabbcc")).toBeCloseTo(1, 5);
  });
});

describe("colorWarning", () => {
  it("is null for dark on light with enough contrast", () => {
    expect(colorWarning("#000000", "#ffffff")).toBeNull();
    expect(colorWarning("#1e3a8a", "#ffffff")).toBeNull();
  });

  it("flags low contrast", () => {
    expect(colorWarning("#999999", "#aaaaaa")).toBe("low-contrast");
    expect(colorWarning("#ff6f00", "#ffffff")).toBe("low-contrast");
  });

  it("flags inverted codes (light modules on dark background)", () => {
    expect(colorWarning("#ffffff", "#000000")).toBe("inverted");
  });

  it("treats invalid colours as low contrast rather than throwing", () => {
    expect(colorWarning("nope", "#ffffff")).toBe("low-contrast");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ASDF_NODEJS_VERSION=24.9.0 npx vitest run app/generate-qr/colors.test.ts`
Expected: FAIL — `Failed to resolve import "./colors"`.

- [ ] **Step 3: Write the implementation** — `app/generate-qr/colors.ts`

```ts
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

// Below this ratio many phone scanners struggle; black-on-white is 21.
const MIN_SCANNABLE_CONTRAST = 4;

export type ColorWarning = "low-contrast" | "inverted" | null;

export function isHexColor(value: string): boolean {
  return HEX.test(value);
}

function toRgb(hex: string): [number, number, number] {
  const h = hex.slice(1);
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function colorWarning(fg: string, bg: string): ColorWarning {
  if (!isHexColor(fg) || !isHexColor(bg)) return "low-contrast";
  if (contrastRatio(fg, bg) < MIN_SCANNABLE_CONTRAST) return "low-contrast";
  if (luminance(fg) > luminance(bg)) return "inverted";
  return null;
}
```

(`#ff6f00` on white is ≈ 2.9:1 → low-contrast; `#1e3a8a` on white is ≈ 10:1 → fine.)

- [ ] **Step 4: Run tests and typecheck**

Run: `ASDF_NODEJS_VERSION=24.9.0 npx vitest run app/generate-qr && ASDF_NODEJS_VERSION=24.9.0 npx tsc --noEmit`
Expected: PASS; tsc clean.

- [ ] **Step 5: Commit**

```bash
git add app/generate-qr/colors.ts app/generate-qr/colors.test.ts
git commit -m "feat(portfolio): add QR colour contrast and inversion check"
```

---

### Task 3: QR renderer (adds the `qrcode` dependency)

**Files:**
- Modify: `package.json`, `package-lock.json` (via npm)
- Create: `app/generate-qr/render.ts`
- Test: `app/generate-qr/render.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks (takes a payload string).
- Produces:
  ```ts
  export type Ecc = "L" | "M" | "Q" | "H";
  export type QrOptions = { ecc: Ecc; size: number; margin: number; fg: string; bg: string };
  export const DEFAULT_OPTIONS: QrOptions; // { ecc: "M", size: 512, margin: 4, fg: "#000000", bg: "#ffffff" }
  export function clampOptions(o: QrOptions): QrOptions; // size 128..2048, margin 0..10, ints
  export type RenderResult =
    | { ok: true; svg: string; pngDataUrl: string }
    | { ok: false; error: "empty" | "too-long" | "failed" };
  export function renderQr(payload: string, options: QrOptions): Promise<RenderResult>;
  export function svgToDataUrl(svg: string): string;
  ```

- [ ] **Step 1: Install the dependency (exact pins)**

```bash
ASDF_NODEJS_VERSION=24.9.0 npm install --save-exact qrcode@1.5.4
ASDF_NODEJS_VERSION=24.9.0 npm install --save-dev --save-exact @types/qrcode@1.5.5
```

Expected: `package.json` gains `"qrcode": "1.5.4"` in `dependencies` and `"@types/qrcode": "1.5.5"` in `devDependencies`.

- [ ] **Step 2: Write the failing test** — `app/generate-qr/render.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { clampOptions, DEFAULT_OPTIONS, renderQr, svgToDataUrl } from "./render";

describe("clampOptions", () => {
  it("clamps size and margin into range and rounds them", () => {
    expect(clampOptions({ ...DEFAULT_OPTIONS, size: 10, margin: -3 })).toMatchObject({
      size: 128,
      margin: 0,
    });
    expect(clampOptions({ ...DEFAULT_OPTIONS, size: 99999, margin: 42.7 })).toMatchObject({
      size: 2048,
      margin: 10,
    });
    expect(clampOptions({ ...DEFAULT_OPTIONS, size: 300.6 }).size).toBe(301);
  });

  it("falls back to defaults for NaN (empty number input)", () => {
    expect(clampOptions({ ...DEFAULT_OPTIONS, size: NaN, margin: NaN })).toMatchObject({
      size: DEFAULT_OPTIONS.size,
      margin: DEFAULT_OPTIONS.margin,
    });
  });
});

describe("renderQr", () => {
  it("renders an SVG and a PNG data URL", async () => {
    const r = await renderQr("https://hulsambath.me", DEFAULT_OPTIONS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.svg).toContain("<svg");
    expect(r.pngDataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("applies the foreground colour", async () => {
    const r = await renderQr("hi", { ...DEFAULT_OPTIONS, fg: "#1e3a8a" });
    expect(r.ok && r.svg.toLowerCase()).toContain("#1e3a8a");
  });

  it("encodes Khmer text", async () => {
    const r = await renderQr("សួស្តី ពិភពលោក 👋", DEFAULT_OPTIONS);
    expect(r.ok).toBe(true);
  });

  it("returns empty for a blank payload", async () => {
    expect(await renderQr("", DEFAULT_OPTIONS)).toEqual({ ok: false, error: "empty" });
  });

  it("too-long payload returns too-long instead of throwing", async () => {
    const r = await renderQr("x".repeat(3000), { ...DEFAULT_OPTIONS, ecc: "H" });
    expect(r).toEqual({ ok: false, error: "too-long" });
  });
});

describe("svgToDataUrl", () => {
  it("produces a utf8 svg data URL with # escaped", () => {
    const url = svgToDataUrl('<svg fill="#000"></svg>');
    expect(url.startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
    expect(url).not.toContain("#");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `ASDF_NODEJS_VERSION=24.9.0 npx vitest run app/generate-qr/render.test.ts`
Expected: FAIL — `Failed to resolve import "./render"`.

- [ ] **Step 4: Write the implementation** — `app/generate-qr/render.ts`

```ts
import QRCode from "qrcode";

export type Ecc = "L" | "M" | "Q" | "H";
export type QrOptions = { ecc: Ecc; size: number; margin: number; fg: string; bg: string };

export const DEFAULT_OPTIONS: QrOptions = {
  ecc: "M",
  size: 512,
  margin: 4,
  fg: "#000000",
  bg: "#ffffff",
};

export type RenderResult =
  | { ok: true; svg: string; pngDataUrl: string }
  | { ok: false; error: "empty" | "too-long" | "failed" };

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function clampOptions(o: QrOptions): QrOptions {
  return {
    ...o,
    size: clamp(o.size, 128, 2048, DEFAULT_OPTIONS.size),
    margin: clamp(o.margin, 0, 10, DEFAULT_OPTIONS.margin),
  };
}

export async function renderQr(payload: string, options: QrOptions): Promise<RenderResult> {
  if (!payload) return { ok: false, error: "empty" };
  const o = clampOptions(options);
  const common = {
    errorCorrectionLevel: o.ecc,
    margin: o.margin,
    width: o.size,
    color: { dark: o.fg, light: o.bg },
  };
  try {
    const [svg, pngDataUrl] = await Promise.all([
      QRCode.toString(payload, { ...common, type: "svg" }),
      QRCode.toDataURL(payload, { ...common, type: "image/png" }),
    ]);
    return { ok: true, svg, pngDataUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: /too big/i.test(message) ? "too-long" : "failed" };
  }
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
```

- [ ] **Step 5: Run tests and typecheck**

Run: `ASDF_NODEJS_VERSION=24.9.0 npx vitest run app/generate-qr && ASDF_NODEJS_VERSION=24.9.0 npx tsc --noEmit`
Expected: PASS; tsc clean. If the `too-long` test fails, log `err.message` once — `qrcode@1.5.4` throws `"The amount of data is too big to be stored in a QR Code"`; adjust the regex only if the message differs.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json app/generate-qr/render.ts app/generate-qr/render.test.ts
git commit -m "feat(portfolio): add qrcode-based SVG/PNG renderer for QR tool"
```

---

### Task 4: Download & clipboard helpers

**Files:**
- Create: `app/generate-qr/download.ts`
- Test: `app/generate-qr/download.test.ts`

**Interfaces:**
- Consumes: `QrInput` from `./payload`.
- Produces:
  ```ts
  export function qrFilename(input: QrInput, ext: "png" | "svg"): string;
  export function dataUrlToBlob(dataUrl: string): Blob;        // base64 data URLs only; no fetch()
  export function triggerDownload(href: string, filename: string): void; // browser-only
  export function canCopyImage(): boolean;                     // browser-only, false on server
  export function copyPngToClipboard(pngDataUrl: string): Promise<void>; // browser-only
  ```

- [ ] **Step 1: Write the failing test** — `app/generate-qr/download.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { canCopyImage, dataUrlToBlob, qrFilename } from "./download";

describe("qrFilename", () => {
  it("slugs the url host and path", () => {
    expect(qrFilename({ kind: "url", url: "https://hulsambath.me/kp-trip?x=1" }, "png")).toBe(
      "qr-hulsambath-me-kp-trip.png",
    );
  });

  it("uses the ssid for wifi and a generic name otherwise", () => {
    expect(
      qrFilename({ kind: "wifi", ssid: "Home 5G", password: "", security: "WPA", hidden: false }, "svg"),
    ).toBe("qr-wifi-home-5g.svg");
    expect(qrFilename({ kind: "text", text: "សួស្តី" }, "png")).toBe("qr-text.png");
  });

  it("falls back when the slug would be empty", () => {
    expect(qrFilename({ kind: "url", url: "" }, "png")).toBe("qr-url.png");
  });
});

describe("dataUrlToBlob", () => {
  it("decodes a base64 data URL without fetch", async () => {
    const blob = dataUrlToBlob("data:image/png;base64,aGVsbG8=");
    expect(blob.type).toBe("image/png");
    expect(await blob.text()).toBe("hello");
  });

  it("throws on non-base64 data URLs", () => {
    expect(() => dataUrlToBlob("data:text/plain,hello")).toThrow();
  });
});

describe("canCopyImage", () => {
  it("is false outside a browser", () => {
    expect(canCopyImage()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ASDF_NODEJS_VERSION=24.9.0 npx vitest run app/generate-qr/download.test.ts`
Expected: FAIL — `Failed to resolve import "./download"`.

- [ ] **Step 3: Write the implementation** — `app/generate-qr/download.ts`

```ts
import type { QrInput } from "./payload";

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function urlSlug(raw: string): string {
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`);
    return slug(`${u.hostname}${u.pathname}`);
  } catch {
    return "";
  }
}

export function qrFilename(input: QrInput, ext: "png" | "svg"): string {
  const detail =
    input.kind === "url" ? urlSlug(input.url.trim())
    : input.kind === "wifi" ? (slug(input.ssid) ? `wifi-${slug(input.ssid)}` : "")
    : "";
  return `qr-${detail || input.kind}.${ext}`;
}

// CSP connect-src does not allow data:, so fetch(dataUrl) would fail in prod.
export function dataUrlToBlob(dataUrl: string): Blob {
  const match = /^data:([^;,]+);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error("Expected a base64 data URL");
  const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: match[1] });
}

export function triggerDownload(href: string, filename: string): void {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function canCopyImage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof ClipboardItem !== "undefined" &&
    typeof navigator.clipboard?.write === "function"
  );
}

export async function copyPngToClipboard(pngDataUrl: string): Promise<void> {
  const blob = dataUrlToBlob(pngDataUrl);
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}
```

- [ ] **Step 4: Run tests and typecheck**

Run: `ASDF_NODEJS_VERSION=24.9.0 npx vitest run app/generate-qr && ASDF_NODEJS_VERSION=24.9.0 npx tsc --noEmit`
Expected: PASS; tsc clean.

- [ ] **Step 5: Commit**

```bash
git add app/generate-qr/download.ts app/generate-qr/download.test.ts
git commit -m "feat(portfolio): add QR download filename and clipboard helpers"
```

---

### Task 5: Page, layout and UI components

**Files:**
- Create: `app/generate-qr/layout.tsx`
- Create: `app/generate-qr/page.tsx`
- Create: `app/generate-qr/components/ContentForm.tsx`
- Create: `app/generate-qr/components/StyleOptions.tsx`
- Create: `app/generate-qr/components/QrPreview.tsx`
- Create: `app/generate-qr/useQrRender.ts`

**Interfaces:**
- Consumes: `QrInput`, `QrKind`, `WifiSecurity`, `emptyInput`, `buildPayload` (Task 1); `colorWarning`, `isHexColor` (Task 2); `QrOptions`, `Ecc`, `DEFAULT_OPTIONS`, `renderQr`, `RenderResult`, `svgToDataUrl` (Task 3); `qrFilename`, `triggerDownload`, `canCopyImage`, `copyPngToClipboard` (Task 4).
- Produces: `useQrRender(payload: string, options: QrOptions): RenderResult | null` (null = first render pending); the `/generate-qr` route.

No unit tests in this task (vitest is node-only and there is no React Testing Library in the repo); it is verified by `tsc`, `npm run build`, and the manual browser checklist in Step 7.

- [ ] **Step 1: Layout with metadata** — `app/generate-qr/layout.tsx`

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "QR Code Generator | Sambath HUL",
  description: "Generate QR codes for links, text, Wi‑Fi and email — entirely in your browser.",
  robots: { index: false, follow: false },
};

export default function GenerateQrLayout({ children }: { children: ReactNode }) {
  return children;
}
```

- [ ] **Step 2: Render hook (ignores stale async results)** — `app/generate-qr/useQrRender.ts`

```ts
"use client";

import { useEffect, useState } from "react";

import { renderQr, type QrOptions, type RenderResult } from "./render";

export function useQrRender(payload: string, options: QrOptions): RenderResult | null {
  const [result, setResult] = useState<RenderResult | null>(null);
  const { ecc, size, margin, fg, bg } = options;

  useEffect(() => {
    let cancelled = false;
    // Small debounce so typing a long URL doesn't re-render the PNG per keystroke.
    const id = setTimeout(() => {
      renderQr(payload, { ecc, size, margin, fg, bg }).then((r) => {
        if (!cancelled) setResult(r);
      });
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [payload, ecc, size, margin, fg, bg]);

  return result;
}
```

- [ ] **Step 3: Content form** — `app/generate-qr/components/ContentForm.tsx`

```tsx
"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { emptyInput, type QrInput, type QrKind, type WifiSecurity } from "../payload";

const KINDS: { kind: QrKind; label: string }[] = [
  { kind: "url", label: "URL" },
  { kind: "text", label: "Text" },
  { kind: "wifi", label: "Wi‑Fi" },
  { kind: "email", label: "Email" },
];

const textareaClass =
  "min-h-28 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export function ContentForm({
  value,
  onChange,
}: {
  value: QrInput;
  onChange: (next: QrInput) => void;
}) {
  return (
    <div className="grid gap-4">
      <div role="tablist" aria-label="Content type" className="flex flex-wrap gap-2">
        {KINDS.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={value.kind === kind}
            onClick={() => value.kind !== kind && onChange(emptyInput(kind))}
            className={cn(
              "rounded-xl border px-3 py-1.5 text-sm transition-colors",
              value.kind === kind
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {value.kind === "url" && (
        <Field label="Link">
          <Input
            type="url"
            inputMode="url"
            autoFocus
            placeholder="hulsambath.me"
            value={value.url}
            onChange={(e) => onChange({ ...value, url: e.target.value })}
          />
        </Field>
      )}

      {value.kind === "text" && (
        <Field label="Text">
          <textarea
            className={textareaClass}
            placeholder="Anything — Khmer and emoji work too"
            value={value.text}
            onChange={(e) => onChange({ ...value, text: e.target.value })}
          />
        </Field>
      )}

      {value.kind === "wifi" && (
        <>
          <Field label="Network name (SSID)">
            <Input value={value.ssid} onChange={(e) => onChange({ ...value, ssid: e.target.value })} />
          </Field>
          <Field label="Security">
            <select
              className="h-11 rounded-2xl border border-input bg-background px-4 text-sm"
              value={value.security}
              onChange={(e) => onChange({ ...value, security: e.target.value as WifiSecurity })}
            >
              <option value="WPA">WPA/WPA2/WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None (open)</option>
            </select>
          </Field>
          {value.security !== "nopass" && (
            <Field label="Password">
              <Input
                type="text"
                autoComplete="off"
                value={value.password}
                onChange={(e) => onChange({ ...value, password: e.target.value })}
              />
            </Field>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.hidden}
              onChange={(e) => onChange({ ...value, hidden: e.target.checked })}
            />
            Hidden network
          </label>
        </>
      )}

      {value.kind === "email" && (
        <>
          <Field label="To">
            <Input type="email" value={value.to} onChange={(e) => onChange({ ...value, to: e.target.value })} />
          </Field>
          <Field label="Subject">
            <Input value={value.subject} onChange={(e) => onChange({ ...value, subject: e.target.value })} />
          </Field>
          <Field label="Body">
            <textarea
              className={textareaClass}
              value={value.body}
              onChange={(e) => onChange({ ...value, body: e.target.value })}
            />
          </Field>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Style options** — `app/generate-qr/components/StyleOptions.tsx`

```tsx
"use client";

import { Input } from "@/components/ui/input";

import { isHexColor } from "../colors";
import type { Ecc, QrOptions } from "../render";

const ECC: { value: Ecc; label: string }[] = [
  { value: "L", label: "L · 7%" },
  { value: "M", label: "M · 15%" },
  { value: "Q", label: "Q · 25%" },
  { value: "H", label: "H · 30%" },
];

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // Native picker needs a valid #rrggbb; the text box accepts anything and
  // only valid hex is ever passed to the renderer (see page.tsx).
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          className="h-11 w-12 cursor-pointer rounded-xl border border-input bg-background"
          value={isHexColor(value) && value.length === 7 ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          value={value}
          spellCheck={false}
          aria-invalid={!isHexColor(value)}
          onChange={(e) => onChange(e.target.value.trim())}
        />
      </div>
    </label>
  );
}

export function StyleOptions({
  value,
  onChange,
}: {
  value: QrOptions;
  onChange: (next: QrOptions) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-medium">
        Error correction
        <select
          className="h-11 rounded-2xl border border-input bg-background px-4 text-sm"
          value={value.ecc}
          onChange={(e) => onChange({ ...value, ecc: e.target.value as Ecc })}
        >
          {ECC.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Size (px)
        <Input
          type="number"
          min={128}
          max={2048}
          step={64}
          value={Number.isFinite(value.size) ? value.size : ""}
          onChange={(e) => onChange({ ...value, size: e.target.valueAsNumber })}
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Margin (modules)
        <Input
          type="number"
          min={0}
          max={10}
          value={Number.isFinite(value.margin) ? value.margin : ""}
          onChange={(e) => onChange({ ...value, margin: e.target.valueAsNumber })}
        />
      </label>
      <div className="hidden sm:block" />
      <ColorField label="Foreground" value={value.fg} onChange={(fg) => onChange({ ...value, fg })} />
      <ColorField label="Background" value={value.bg} onChange={(bg) => onChange({ ...value, bg })} />
    </div>
  );
}
```

- [ ] **Step 5: Preview + actions** — `app/generate-qr/components/QrPreview.tsx`

```tsx
"use client";

import { Check, Copy, Download, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import type { ColorWarning } from "../colors";
import { canCopyImage, copyPngToClipboard, triggerDownload } from "../download";
import { svgToDataUrl, type RenderResult } from "../render";

const ERRORS = {
  empty: "Enter something to encode.",
  "too-long": "Too much data for a QR code at this error-correction level. Shorten it or pick a lower level.",
  failed: "Couldn't generate this QR code.",
} as const;

const WARNINGS: Record<Exclude<ColorWarning, null>, string> = {
  "low-contrast": "Low contrast — some scanners may not read this.",
  inverted: "Light-on-dark codes aren't supported by every scanner.",
};

export function QrPreview({
  result,
  warning,
  filenameFor,
}: {
  result: RenderResult | null;
  warning: ColorWarning;
  filenameFor: (ext: "png" | "svg") => string;
}) {
  const [copyable, setCopyable] = useState(false);
  const [copied, setCopied] = useState<"idle" | "done" | "error">("idle");
  useEffect(() => setCopyable(canCopyImage()), []);
  useEffect(() => setCopied("idle"), [result]);

  const ok = result?.ok === true;

  return (
    <div className="grid gap-4">
      <div className="grid aspect-square w-full place-items-center rounded-2xl border border-border bg-muted p-4">
        {ok ? (
          <img
            src={svgToDataUrl(result.svg)}
            alt="Generated QR code"
            className="h-full w-full object-contain"
          />
        ) : (
          <p className="max-w-60 text-center text-sm text-muted-foreground" role="status">
            {result ? ERRORS[result.error] : "Generating…"}
          </p>
        )}
      </div>

      {ok && warning && (
        <p className="flex items-start gap-2 text-sm text-destructive" role="status">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {WARNINGS[warning]}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button disabled={!ok} onClick={() => ok && triggerDownload(result.pngDataUrl, filenameFor("png"))}>
          <Download /> PNG
        </Button>
        <Button
          variant="outline"
          disabled={!ok}
          onClick={() => ok && triggerDownload(svgToDataUrl(result.svg), filenameFor("svg"))}
        >
          <Download /> SVG
        </Button>
        {copyable && (
          <Button
            variant="outline"
            disabled={!ok}
            onClick={() =>
              ok &&
              copyPngToClipboard(result.pngDataUrl).then(
                () => setCopied("done"),
                () => setCopied("error"),
              )
            }
          >
            {copied === "done" ? <Check /> : <Copy />}
            {copied === "done" ? "Copied" : copied === "error" ? "Copy failed" : "Copy"}
          </Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Page** — `app/generate-qr/page.tsx`

```tsx
"use client";

import { QrCode } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { colorWarning, isHexColor } from "./colors";
import { ContentForm } from "./components/ContentForm";
import { QrPreview } from "./components/QrPreview";
import { StyleOptions } from "./components/StyleOptions";
import { qrFilename } from "./download";
import { buildPayload, emptyInput, type QrInput } from "./payload";
import { DEFAULT_OPTIONS, type QrOptions } from "./render";
import { useQrRender } from "./useQrRender";

export default function GenerateQrPage() {
  const [input, setInput] = useState<QrInput>(() => emptyInput("url"));
  const [options, setOptions] = useState<QrOptions>(DEFAULT_OPTIONS);

  // Keep half-typed colours in the form, but only render with valid ones.
  const renderOptions: QrOptions = {
    ...options,
    fg: isHexColor(options.fg) ? options.fg : DEFAULT_OPTIONS.fg,
    bg: isHexColor(options.bg) ? options.bg : DEFAULT_OPTIONS.bg,
  };
  const result = useQrRender(buildPayload(input), renderOptions);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:py-16">
      <header className="mb-8 flex items-center gap-3">
        <QrCode className="size-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">QR Code Generator</h1>
          <p className="text-sm text-muted-foreground">Runs entirely in your browser — nothing is uploaded.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>What the code should open or contain.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentForm value={input} onChange={setInput} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Style</CardTitle>
            </CardHeader>
            <CardContent>
              <StyleOptions value={options} onChange={setOptions} />
            </CardContent>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-6 lg:self-start">
          <CardContent className="pt-6">
            <QrPreview
              result={result}
              warning={colorWarning(options.fg, options.bg)}
              filenameFor={(ext) => qrFilename(input, ext)}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
```

Before relying on them, open `components/ui/card.tsx` and confirm `CardContent` padding — if it already has top padding, drop `pt-6`. If `app/auto-scroll-demo.tsx` (wraps every route in the root layout) does anything route-specific, check it doesn't interfere with `/generate-qr`.

- [ ] **Step 7: Verify**

```bash
ASDF_NODEJS_VERSION=24.9.0 npx tsc --noEmit
ASDF_NODEJS_VERSION=24.9.0 npx vitest run
ASDF_NODEJS_VERSION=24.9.0 npm run build
ls out/generate-qr/index.html
ASDF_NODEJS_VERSION=24.9.0 npm run dev   # then open http://localhost:3000/generate-qr
```

Manual checklist in the browser (light **and** dark theme, desktop **and** ~375px wide):
- Typing `hulsambath.me` shows a code; scanning it with a phone opens `https://hulsambath.me`.
- Wi‑Fi tab with SSID `Test;Net` and a password → phone offers to join `Test;Net`.
- Text tab with Khmer text → scans back to the same text.
- Paste ~3 000 characters at ECC `H` → "Too much data…" message, buttons disabled, no console errors.
- Foreground `#ffffff` on `#000000` → "Light-on-dark…" warning shown.
- Foreground typed as `#12` (invalid) → preview keeps rendering with the default colour, input marked invalid.
- Size field cleared → preview still renders (clamped to default).
- PNG / SVG download filenames look like `qr-hulsambath-me.png`; SVG opens in a browser.
- Copy → paste into a chat/notes app pastes an image. No CSP violations in the console.

- [ ] **Step 8: Commit**

```bash
git add app/generate-qr
git commit -m "feat(portfolio): add /generate-qr QR code generator page"
```

---

### Task 6: Documentation

**Files:**
- Modify: `docs/routing.md` (routes table + a `/generate-qr` section)

- [ ] **Step 1: Update the routes table** — change "**2 routes**" to "**4 routes**" only after confirming the real count (the doc currently omits `/predictor`; add it too if it is missing) and add the row:

```markdown
| `/generate-qr` | `app/generate-qr/page.tsx` | Personal QR code generator (client-only, `noindex`) |
```

- [ ] **Step 2: Add a section** below the `/kp-trip` section:

```markdown
## `/generate-qr` page
- Client-only QR generator (URL, text, Wi‑Fi, email) using the `qrcode` package —
  encoding happens in the browser; no network calls, so no CSP changes.
- Pure logic is unit-tested in `app/generate-qr/{payload,colors,render,download}.ts`.
- Deliberately unlisted: not in the nav or `public/sitemap.xml`, and its layout sets
  `robots: noindex`. To make it public, remove the `robots` metadata and add a sitemap entry.
- Clipboard copy converts the PNG data URL to a Blob locally — never `fetch()` a
  `data:` URL here, because CSP `connect-src` doesn't allow it.
```

- [ ] **Step 3: Commit**

```bash
git add docs/routing.md
git commit -m "docs(portfolio): document /generate-qr route"
```
