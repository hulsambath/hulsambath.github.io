const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

// Below this ratio many phone scanners struggle; black-on-white is 21.
const MIN_SCANNABLE_CONTRAST = 4;

export type ColorWarning = "invalid" | "low-contrast" | "inverted" | null;

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
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function colorWarning(fg: string, bg: string): ColorWarning {
  if (!isHexColor(fg) || !isHexColor(bg)) return "invalid";
  if (contrastRatio(fg, bg) < MIN_SCANNABLE_CONTRAST) return "low-contrast";
  if (luminance(fg) > luminance(bg)) return "inverted";
  return null;
}
