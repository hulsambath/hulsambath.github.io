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
