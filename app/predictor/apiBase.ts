export function apiBase(): string {
  if (process.env.NEXT_PUBLIC_PREDICTOR_API) return process.env.NEXT_PUBLIC_PREDICTOR_API;
  if (typeof window !== "undefined" && window.location.hostname.endsWith("hulsambath.me"))
    return "https://predictor-api.hulsambath.me";
  return "http://localhost:8000";
}
export const wsBase = () => apiBase().replace(/^http/, "ws");

// Prefer the image URL persisted by the API because teams can come from
// different ingest sources. Fall back to SofaScore for older payloads.
export const crestUrl = (sofascoreTeamId: number, logoUrl?: string | null) =>
  logoUrl || `https://api.sofascore.com/api/v1/team/${sofascoreTeamId}/image`;

export const leagueLogoUrl = (sofascoreLeagueId?: number | null) =>
  sofascoreLeagueId == null ? null : `https://api.sofascore.com/api/v1/unique-tournament/${sofascoreLeagueId}/image`;
