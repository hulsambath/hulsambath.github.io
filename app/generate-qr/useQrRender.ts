"use client";

import { useEffect, useState } from "react";

import { composePngWithLogo, composeSvgWithLogo, effectiveEcc, type Logo } from "./logo";
import { clampOptions, renderQr, type QrOptions, type RenderResult } from "./render";

export function useQrRender(
  payload: string,
  options: QrOptions,
  logoDataUrl: string | null,
): RenderResult | null {
  const [result, setResult] = useState<RenderResult | null>(null);
  const { ecc, size, margin, fg, bg, transparent, logoScale, logoPlate } = options;

  useEffect(() => {
    let cancelled = false;
    // Small debounce so typing a long URL doesn't re-render the PNG per keystroke.
    const id = setTimeout(async () => {
      const opts = clampOptions({
        ecc: effectiveEcc(ecc, logoDataUrl !== null),
        size,
        margin,
        fg,
        bg,
        transparent,
        logoScale,
        logoPlate,
      });
      let r = await renderQr(payload, opts);
      if (r.ok && logoDataUrl) {
        const logo: Logo = {
          dataUrl: logoDataUrl,
          scale: opts.logoScale,
          plate: opts.logoPlate,
          // A transparent code still needs a solid plate for the logo to sit on.
          plateColor: opts.transparent ? "#ffffff" : opts.bg,
        };
        try {
          r = {
            ok: true,
            svg: composeSvgWithLogo(r.svg, logo),
            pngDataUrl: await composePngWithLogo(r.pngDataUrl, logo),
          };
        } catch {
          r = { ok: false, error: "logo" };
        }
      }
      if (!cancelled) setResult(r);
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [payload, ecc, size, margin, fg, bg, transparent, logoScale, logoPlate, logoDataUrl]);

  return result;
}
