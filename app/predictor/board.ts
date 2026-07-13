export type StatusFilter = "live" | "finished" | "upcoming";

export const FINISHED = new Set(["FT", "AET", "PEN"]);
export const NOT_LIVE = new Set(["NS", "PST", "CANC", "FT", "AET", "PEN"]);

export const isFinished = (s: string): boolean => FINISHED.has(s);
export const isLive = (s: string): boolean => !NOT_LIVE.has(s);

export function classify(status: string): StatusFilter {
  if (isLive(status)) return "live";
  if (isFinished(status)) return "finished";
  return "upcoming";
}

// Regional-indicator flag from a 2-letter ISO code.
function iso2ToFlag(code: string): string {
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt(0)));
}

// Country display name (as SofaScore/backend emits) → ISO2, plus a few
// custom-flag exceptions. Extend as new countries appear in /leagues.
const COUNTRY_ISO2: Record<string, string> = {
  Spain: "ES", Italy: "IT", Germany: "DE", France: "FR", Portugal: "PT",
  Netherlands: "NL", Belgium: "BE", Brazil: "BR", Argentina: "AR",
  Bolivia: "BO", Ecuador: "EC", Norway: "NO", USA: "US", Cameroon: "CM",
  Colombia: "CO", Mexico: "MX", Chile: "CL", Uruguay: "UY", Peru: "PE",
  Japan: "JP", "South Korea": "KR", Australia: "AU", Turkey: "TR",
  Scotland: "GB-SCT", Wales: "GB-WLS",
};

const CUSTOM_FLAGS: Record<string, string> = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

// Region/umbrella labels that have no national flag.
const NO_FLAG = new Set(["World", "International", "Europe", "Club", ""]);

export function countryFlag(country: string | null | undefined): string | null {
  if (!country || NO_FLAG.has(country)) return null;
  if (CUSTOM_FLAGS[country]) return CUSTOM_FLAGS[country];
  const iso = COUNTRY_ISO2[country];
  if (!iso || iso.includes("-")) return null; // subdivisions handled by CUSTOM_FLAGS
  return iso2ToFlag(iso);
}
