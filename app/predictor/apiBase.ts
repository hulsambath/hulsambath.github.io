export function apiBase(): string {
  if (process.env.NEXT_PUBLIC_PREDICTOR_API) return process.env.NEXT_PUBLIC_PREDICTOR_API;
  if (typeof window !== "undefined" && window.location.hostname.endsWith("hulsambath.me"))
    return "https://predictor-api.hulsambath.me";
  return "http://localhost:8000";
}
export const wsBase = () => apiBase().replace(/^http/, "ws");

// Team crest, fetched directly from SofaScore. Real browsers pass SofaScore's
// Cloudflare check, so this works from the client even though the Heroku
// backend (datacenter IP) is blocked — hence not the backend image proxy.
export const crestUrl = (sofascoreTeamId: number) =>
  `https://api.sofascore.com/api/v1/team/${sofascoreTeamId}/image`;
