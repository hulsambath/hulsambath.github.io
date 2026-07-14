export function apiBase(): string {
  if (process.env.NEXT_PUBLIC_PREDICTOR_API) return process.env.NEXT_PUBLIC_PREDICTOR_API;
  if (typeof window !== "undefined" && window.location.hostname.endsWith("hulsambath.me"))
    return "https://predictor-api.hulsambath.me";
  return "http://localhost:8000";
}
export const wsBase = () => apiBase().replace(/^http/, "ws");
