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
  invalid: "Invalid colour — using the default until it's a valid hex like #1e3a8a.",
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
