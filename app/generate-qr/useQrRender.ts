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
