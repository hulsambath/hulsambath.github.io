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
