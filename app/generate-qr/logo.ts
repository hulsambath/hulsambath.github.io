import type { Ecc } from "./render";

const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
// Plate padding around the logo, as a fraction of the logo size.
const PLATE_PAD = 0.1;

export type LogoError = "type" | "size" | "read";
export type Logo = { dataUrl: string; scale: number; plate: boolean; plateColor: string };

export function validateLogoFile(file: { type: string; size: number }): LogoError | null {
  if (!LOGO_TYPES.includes(file.type)) return "type";
  if (file.size > MAX_LOGO_BYTES) return "size";
  return null;
}

/** A centre logo hides modules, so always use the highest error correction. */
export function effectiveEcc(ecc: Ecc, hasLogo: boolean): Ecc {
  return hasLogo ? "H" : ecc;
}

const round = (n: number) => Number(n.toFixed(3));

export function logoBox(total: number, scale: number) {
  const size = total * scale;
  const pad = size * PLATE_PAD;
  const x = (total - size) / 2;
  return {
    x: round(x),
    y: round(x),
    size: round(size),
    plateX: round(x - pad),
    plateY: round(x - pad),
    plateSize: round(size + pad * 2),
  };
}

const IMAGE_DATA_URL = /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+$/i;

export function composeSvgWithLogo(svg: string, logo: Logo): string {
  // Only base64 image data URLs go into the href, so nothing can break out of the attribute.
  if (!IMAGE_DATA_URL.test(logo.dataUrl)) throw new Error("Logo must be a base64 image data URL");
  const viewBox = /viewBox="0 0 ([\d.]+) [\d.]+"/.exec(svg)?.[1];
  if (!viewBox) throw new Error("QR SVG has no viewBox");
  const b = logoBox(Number(viewBox), logo.scale);
  const plate = logo.plate
    ? `<rect x="${b.plateX}" y="${b.plateY}" width="${b.plateSize}" height="${b.plateSize}" rx="${round(b.plateSize * 0.15)}" fill="${logo.plateColor}"/>`
    : "";
  const image = `<image x="${b.x}" y="${b.y}" width="${b.size}" height="${b.size}" preserveAspectRatio="xMidYMid meet" href="${logo.dataUrl}" xlink:href="${logo.dataUrl}"/>`;
  return svg
    .replace("<svg ", '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ')
    .replace(/<\/svg>\s*$/, `${plate}${image}</svg>`);
}

/* ---- browser-only helpers ---- */

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

/** Draws the logo (and plate) over the QR PNG on a canvas; returns a PNG data URL. */
export async function composePngWithLogo(pngDataUrl: string, logo: Logo): Promise<string> {
  const [qr, mark] = await Promise.all([loadImage(pngDataUrl), loadImage(logo.dataUrl)]);
  const canvas = document.createElement("canvas");
  canvas.width = qr.naturalWidth;
  canvas.height = qr.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(qr, 0, 0);
  const b = logoBox(canvas.width, logo.scale);
  if (logo.plate) {
    ctx.fillStyle = logo.plateColor;
    ctx.beginPath();
    ctx.roundRect(b.plateX, b.plateY, b.plateSize, b.plateSize, b.plateSize * 0.15);
    ctx.fill();
  }
  // Fit the logo inside its square without distorting it.
  const ratio = Math.min(b.size / mark.naturalWidth, b.size / mark.naturalHeight) || 1;
  const w = mark.naturalWidth * ratio;
  const h = mark.naturalHeight * ratio;
  ctx.drawImage(mark, b.x + (b.size - w) / 2, b.y + (b.size - h) / 2, w, h);
  return canvas.toDataURL("image/png");
}
