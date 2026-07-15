import { apiBase } from "./apiBase";
import type { DateBucket, League, Match, MatchDetail } from "./types";

async function readJson<T>(path: string): Promise<T> {
  const candidates = path.startsWith("/api/v1/")
    ? [path, path.replace(/^\/api\/v1/, "")]
    : [`/api/v1${path}`, path];

  let lastError: Error | null = null;
  for (const candidate of candidates) {
    const response = await fetch(`${apiBase()}${candidate}`);
    if (response.ok) return response.json() as Promise<T>;
    if (response.status !== 404) {
      throw new Error(`request failed: ${response.status}`);
    }
    lastError = new Error(`request failed: ${response.status}`);
  }
  throw lastError ?? new Error("request failed");
}

export function fetchLeagues(): Promise<League[]> {
  return readJson<League[]>("/leagues");
}

export function fetchDateBuckets(): Promise<DateBucket[]> {
  return readJson<DateBucket[]>("/matches/dates");
}

export function fetchMatchesByDate(date: string): Promise<Match[]> {
  return readJson<Match[]>(`/matches/by-date?date=${date}`);
}

export function fetchMatchDetail(matchId: number): Promise<MatchDetail> {
  return readJson<MatchDetail>(`/matches/${matchId}/detail`);
}
