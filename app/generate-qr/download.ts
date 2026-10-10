import { buildPayload, type QrInput } from "./payload";

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function urlSlug(input: QrInput): string {
  try {
    const u = new URL(buildPayload(input));
    return slug(`${u.hostname}${u.pathname}`);
  } catch {
    return "";
  }
}

export function qrFilename(input: QrInput, ext: "png" | "svg"): string {
  const detail =
    input.kind === "url" ? urlSlug(input)
    : input.kind === "wifi" ? (slug(input.ssid) ? `wifi-${slug(input.ssid)}` : "")
    : "";
  return `qr-${detail || input.kind}.${ext}`;
}

// CSP connect-src does not allow data:, so fetch(dataUrl) would fail in prod.
export function dataUrlToBlob(dataUrl: string): Blob {
  const match = /^data:([^;,]+);base64,(.*)$/.exec(dataUrl);
  const [, type, data] = match ?? [];
  if (type === undefined || data === undefined) throw new Error("Expected a base64 data URL");
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type });
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
