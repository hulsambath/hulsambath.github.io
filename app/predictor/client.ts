import { apiBase } from "./apiBase";
import type { DateBucket, League, Match, MatchDetail } from "./types";

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`);
  if (!response.ok) throw new Error(`request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export function fetchLeagues(): Promise<League[]> {
  return readJson<League[]>("/api/v1/leagues");
}

export function fetchDateBuckets(): Promise<DateBucket[]> {
  return readJson<DateBucket[]>("/api/v1/matches/dates");
}

export function fetchMatchesByDate(date: string): Promise<Match[]> {
  return readJson<Match[]>(`/api/v1/matches/by-date?date=${date}`);
}

export function fetchMatchDetail(matchId: number): Promise<MatchDetail> {
  return readJson<MatchDetail>(`/api/v1/matches/${matchId}/detail`);
}
