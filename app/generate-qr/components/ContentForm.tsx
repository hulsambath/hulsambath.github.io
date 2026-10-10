"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { emptyInput, type QrInput, type QrKind, type WifiSecurity } from "../payload";

const KINDS: { kind: QrKind; label: string }[] = [
  { kind: "url", label: "URL" },
  { kind: "text", label: "Text" },
  { kind: "wifi", label: "Wi‑Fi" },
  { kind: "email", label: "Email" },
];

const textareaClass =
  "min-h-28 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export function ContentForm({
  value,
  onChange,
}: {
  value: QrInput;
  onChange: (next: QrInput) => void;
}) {
  return (
    <div className="grid gap-4">
      <div role="tablist" aria-label="Content type" className="flex flex-wrap gap-2">
        {KINDS.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={value.kind === kind}
            onClick={() => value.kind !== kind && onChange(emptyInput(kind))}
            className={cn(
              "rounded-xl border px-3 py-1.5 text-sm transition-colors",
              value.kind === kind
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {value.kind === "url" && (
        <Field label="Link">
          <Input
            type="url"
            inputMode="url"
            autoFocus
            placeholder="hulsambath.me"
            value={value.url}
            onChange={(e) => onChange({ ...value, url: e.target.value })}
          />
        </Field>
      )}

      {value.kind === "text" && (
        <Field label="Text">
          <textarea
            className={textareaClass}
            placeholder="Anything — Khmer and emoji work too"
            value={value.text}
            onChange={(e) => onChange({ ...value, text: e.target.value })}
          />
        </Field>
      )}

      {value.kind === "wifi" && (
        <>
          <Field label="Network name (SSID)">
            <Input value={value.ssid} onChange={(e) => onChange({ ...value, ssid: e.target.value })} />
          </Field>
          <Field label="Security">
            <select
              className="h-11 rounded-2xl border border-input bg-background px-4 text-sm"
              value={value.security}
              onChange={(e) => onChange({ ...value, security: e.target.value as WifiSecurity })}
            >
              <option value="WPA">WPA/WPA2/WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None (open)</option>
            </select>
          </Field>
          {value.security !== "nopass" && (
            <Field label="Password">
              <Input
                type="text"
                autoComplete="off"
                value={value.password}
                onChange={(e) => onChange({ ...value, password: e.target.value })}
              />
            </Field>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.hidden}
              onChange={(e) => onChange({ ...value, hidden: e.target.checked })}
            />
            Hidden network
          </label>
        </>
      )}

      {value.kind === "email" && (
        <>
          <Field label="To">
            <Input type="email" value={value.to} onChange={(e) => onChange({ ...value, to: e.target.value })} />
          </Field>
          <Field label="Subject">
            <Input value={value.subject} onChange={(e) => onChange({ ...value, subject: e.target.value })} />
          </Field>
          <Field label="Body">
            <textarea
              className={textareaClass}
              value={value.body}
              onChange={(e) => onChange({ ...value, body: e.target.value })}
            />
          </Field>
        </>
      )}
    </div>
  );
}
