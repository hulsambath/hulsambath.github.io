export type QrKind = "url" | "text" | "wifi" | "email";
export type WifiSecurity = "WPA" | "WEP" | "nopass";

export type QrInput =
  | { kind: "url"; url: string }
  | { kind: "text"; text: string }
  | { kind: "wifi"; ssid: string; password: string; security: WifiSecurity; hidden: boolean }
  | { kind: "email"; to: string; subject: string; body: string };

export function emptyInput(kind: QrKind): QrInput {
  switch (kind) {
    case "url":
      return { kind, url: "" };
    case "text":
      return { kind, text: "" };
    case "wifi":
      return { kind, ssid: "", password: "", security: "WPA", hidden: false };
    case "email":
      return { kind, to: "", subject: "", body: "" };
  }
}

// WIFI: payload format reserves \ ; , " : — each must be backslash-escaped.
function escapeWifi(value: string): string {
  return value.replace(/([\\;,":])/g, "\\$1");
}

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** The exact string to encode, or "" when there is nothing to encode yet. */
export function buildPayload(input: QrInput): string {
  switch (input.kind) {
    case "url": {
      const url = input.url.trim();
      if (!url) return "";
      return HAS_SCHEME.test(url) ? url : `https://${url}`;
    }
    case "text":
      return input.text.trim() ? input.text : "";
    case "wifi": {
      if (!input.ssid) return "";
      let out = `WIFI:T:${input.security};S:${escapeWifi(input.ssid)};`;
      if (input.security !== "nopass") out += `P:${escapeWifi(input.password)};`;
      if (input.hidden) out += "H:true;";
      return `${out};`;
    }
    case "email": {
      const to = input.to.trim();
      if (!to) return "";
      const params = [
        input.subject && `subject=${encodeURIComponent(input.subject)}`,
        input.body && `body=${encodeURIComponent(input.body)}`,
      ].filter(Boolean);
      return params.length ? `mailto:${to}?${params.join("&")}` : `mailto:${to}`;
    }
  }
}
