import { describe, expect, it } from "vitest";

import { composeSvgWithLogo, effectiveEcc, logoBox, validateLogoFile } from "./logo";

const QR_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 29 29" shape-rendering="crispEdges"><path d="M0 0h1"/></svg>';
const LOGO = "data:image/png;base64,aGVsbG8=";

describe("validateLogoFile", () => {
  it("accepts common image types up to 2 MB", () => {
    expect(validateLogoFile({ type: "image/png", size: 1000 })).toBeNull();
    expect(validateLogoFile({ type: "image/svg+xml", size: 1000 })).toBeNull();
    expect(validateLogoFile({ type: "image/jpeg", size: 2 * 1024 * 1024 })).toBeNull();
  });

  it("rejects other types and oversized files", () => {
    expect(validateLogoFile({ type: "application/pdf", size: 10 })).toBe("type");
    expect(validateLogoFile({ type: "image/png", size: 2 * 1024 * 1024 + 1 })).toBe("size");
  });
});

describe("effectiveEcc", () => {
  it("forces H when a logo covers part of the code", () => {
    expect(effectiveEcc("L", true)).toBe("H");
    expect(effectiveEcc("M", true)).toBe("H");
  });

  it("keeps the chosen level without a logo", () => {
    expect(effectiveEcc("L", false)).toBe("L");
  });
});

describe("logoBox", () => {
  it("centres a square of the given fraction with a padded plate", () => {
    const b = logoBox(100, 0.2);
    expect(b).toEqual({ x: 40, y: 40, size: 20, plateX: 38, plateY: 38, plateSize: 24 });
  });
});

describe("composeSvgWithLogo", () => {
  it("adds a plate and an image centred in viewBox units", () => {
    const svg = composeSvgWithLogo(QR_SVG, { dataUrl: LOGO, scale: 0.2, plate: true, plateColor: "#ffffff" });
    expect(svg).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');
    expect(svg).toMatch(/<rect x="11\.02" y="11\.02" width="6\.96" height="6\.96"[^>]*fill="#ffffff"/);
    expect(svg).toContain(`<image x="11.6" y="11.6" width="5.8" height="5.8"`);
    expect(svg).toContain(`href="${LOGO}"`);
    expect(svg.endsWith("</svg>")).toBe(true);
    expect(svg.indexOf("<rect")).toBeGreaterThan(svg.indexOf("<path"));
  });

  it("omits the plate when disabled", () => {
    const svg = composeSvgWithLogo(QR_SVG, { dataUrl: LOGO, scale: 0.2, plate: false, plateColor: "#ffffff" });
    expect(svg).not.toContain("<rect");
    expect(svg).toContain("<image");
  });

  it("refuses logo sources that are not image data URLs", () => {
    expect(() =>
      composeSvgWithLogo(QR_SVG, { dataUrl: 'x" onload="alert(1)', scale: 0.2, plate: false, plateColor: "#fff" }),
    ).toThrow();
  });
});
