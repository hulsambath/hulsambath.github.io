import QRCode from "qrcode";

export type Ecc = "L" | "M" | "Q" | "H";
export type QrOptions = {
  ecc: Ecc;
  size: number;
  margin: number;
  fg: string;
  bg: string;
  transparent: boolean;
  /** Logo width as a fraction of the whole code (only used when a logo is set). */
  logoScale: number;
  /** Draw a background-coloured plate behind the logo. */
  logoPlate: boolean;
};

export const DEFAULT_OPTIONS: QrOptions = {
  ecc: "M",
  size: 512,
  margin: 4,
  fg: "#000000",
  bg: "#ffffff",
  transparent: false,
  logoScale: 0.22,
  logoPlate: true,
};

export type RenderResult =
  | { ok: true; svg: string; pngDataUrl: string }
  | { ok: false; error: "empty" | "too-long" | "failed" | "logo" };

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function clampOptions(o: QrOptions): QrOptions {
  return {
    ...o,
    size: clamp(o.size, 128, 2048, DEFAULT_OPTIONS.size),
    margin: clamp(o.margin, 0, 10, DEFAULT_OPTIONS.margin),
    // Above ~25% of the width the logo hides more than error correction H can recover.
    logoScale: Number.isFinite(o.logoScale)
      ? Math.min(0.25, Math.max(0.1, o.logoScale))
      : DEFAULT_OPTIONS.logoScale,
  };
}

export async function renderQr(payload: string, options: QrOptions): Promise<RenderResult> {
  if (!payload) return { ok: false, error: "empty" };
  const o = clampOptions(options);
  const common = {
    errorCorrectionLevel: o.ecc,
    margin: o.margin,
    width: o.size,
    // A fully transparent light colour makes qrcode omit the background.
    color: { dark: o.fg, light: o.transparent ? "#00000000" : o.bg },
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
