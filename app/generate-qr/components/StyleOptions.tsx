"use client";

import { Input } from "@/components/ui/input";

import { isHexColor } from "../colors";
import type { Ecc, QrOptions } from "../render";

const ECC: { value: Ecc; label: string }[] = [
  { value: "L", label: "L · 7%" },
  { value: "M", label: "M · 15%" },
  { value: "Q", label: "Q · 25%" },
  { value: "H", label: "H · 30%" },
];

function ColorField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  // Native picker needs a valid #rrggbb; the text box accepts anything and
  // only valid hex is ever passed to the renderer (see page.tsx).
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          disabled={disabled}
          className="h-11 w-12 cursor-pointer rounded-xl border border-input bg-background disabled:cursor-not-allowed disabled:opacity-50"
          value={isHexColor(value) && value.length === 7 ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          value={value}
          spellCheck={false}
          disabled={disabled}
          aria-invalid={!isHexColor(value)}
          onChange={(e) => onChange(e.target.value.trim())}
        />
      </div>
    </label>
  );
}

export function StyleOptions({
  value,
  onChange,
  eccLocked,
}: {
  value: QrOptions;
  onChange: (next: QrOptions) => void;
  /** A logo forces error correction to H. */
  eccLocked: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-medium">
        Error correction
        <select
          className="h-11 rounded-2xl border border-input bg-background px-4 text-sm"
          value={eccLocked ? "H" : value.ecc}
          disabled={eccLocked}
          onChange={(e) => onChange({ ...value, ecc: e.target.value as Ecc })}
        >
          {ECC.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {eccLocked && (
          <span className="text-xs font-normal text-muted-foreground">Set to H while a logo is added.</span>
        )}
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Size (px)
        <Input
          type="number"
          min={128}
          max={2048}
          step={64}
          value={Number.isFinite(value.size) ? value.size : ""}
          onChange={(e) => onChange({ ...value, size: e.target.valueAsNumber })}
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Margin (modules)
        <Input
          type="number"
          min={0}
          max={10}
          value={Number.isFinite(value.margin) ? value.margin : ""}
          onChange={(e) => onChange({ ...value, margin: e.target.valueAsNumber })}
        />
      </label>
      <label className="flex items-center gap-2 self-end pb-3 text-sm">
        <input
          type="checkbox"
          checked={value.transparent}
          onChange={(e) => onChange({ ...value, transparent: e.target.checked })}
        />
        Transparent background
      </label>
      <ColorField label="Foreground" value={value.fg} onChange={(fg) => onChange({ ...value, fg })} />
      <ColorField
        label="Background"
        value={value.bg}
        disabled={value.transparent}
        onChange={(bg) => onChange({ ...value, bg })}
      />
    </div>
  );
}
