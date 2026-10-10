"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { readFileAsDataUrl, validateLogoFile, type LogoError } from "../logo";
import type { QrOptions } from "../render";

const ERRORS: Record<LogoError, string> = {
  type: "Use a PNG, JPG, WebP, GIF or SVG image.",
  size: "Logo must be 2 MB or smaller.",
  read: "Couldn't read that file.",
};

export function LogoOptions({
  logo,
  onLogo,
  value,
  onChange,
}: {
  logo: string | null;
  onLogo: (dataUrl: string | null) => void;
  value: QrOptions;
  onChange: (next: QrOptions) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<LogoError | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    const invalid = validateLogoFile(file);
    setError(invalid);
    if (invalid) return;
    try {
      onLogo(await readFileAsDataUrl(file));
    } catch {
      setError("read");
    }
  }

  return (
    <div className="grid gap-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="sr-only"
        aria-label="Logo image"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        {logo && (
          <img src={logo} alt="Logo preview" className="size-11 rounded-xl border border-border object-contain p-1" />
        )}
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <ImagePlus /> {logo ? "Replace logo" : "Add logo"}
        </Button>
        {logo && (
          <Button variant="ghost" onClick={() => onLogo(null)}>
            <X /> Remove
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {ERRORS[error]}
        </p>
      )}
      {logo && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium">
            Logo size ({Math.round(value.logoScale * 100)}%)
            <input
              type="range"
              min={10}
              max={25}
              step={1}
              value={Math.round(value.logoScale * 100)}
              onChange={(e) => onChange({ ...value, logoScale: e.target.valueAsNumber / 100 })}
              className="accent-primary"
            />
          </label>
          <label className="flex items-center gap-2 self-end pb-1 text-sm">
            <input
              type="checkbox"
              checked={value.logoPlate}
              onChange={(e) => onChange({ ...value, logoPlate: e.target.checked })}
            />
            Background behind logo
          </label>
        </div>
      )}
    </div>
  );
}
