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
