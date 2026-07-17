import type { Match } from "./types";

export type RealtimeMessage = {
  type?: unknown;
  match_id?: unknown;
  version?: unknown;
};

export type MatchEventMessage = {
  type: string;
  match_id: number;
  version: number;
  changes?: Record<string, unknown>;
};

export function parseRealtimeMessage(raw: string): RealtimeMessage | null {
  try {
    return JSON.parse(raw) as RealtimeMessage;
  } catch {
    return null;
  }
}

export function shouldRefreshSelectedDay(
  message: MatchEventMessage,
  selectedDate: string,
  today: string,
): boolean {
  return selectedDate === today && shouldProcessMatchEvent(message);
}

export function shouldProcessMatchEvent(message: RealtimeMessage): message is MatchEventMessage {
  return typeof message.type === "string"
    && message.type.endsWith(".updated")
    && typeof message.match_id === "number"
    && typeof message.version === "number";
}

export function matchVersionMap(matches: Match[]): Map<number, number> {
  return new Map(matches.map((match) => [match.id, match.version]));
}

export function needsRefetchForEvent(
  matches: Match[],
  message: MatchEventMessage,
): boolean {
  const current = matchVersionMap(matches).get(message.match_id);
  if (current == null) return false;
  return message.version !== current + 1;
}

/** Odds and prediction events only carry identity/version metadata, not the
 * nested board objects. REST remains the source of truth for those updates. */
export function eventNeedsSnapshot(message: MatchEventMessage): boolean {
  return message.type === "odds.updated" || message.type === "prediction.updated";
}

export function patchMatchVersion(matches: Match[], message: MatchEventMessage): Match[] {
  return matches.map((match) =>
    match.id === message.match_id ? { ...match, ...(message.changes || {}), version: message.version } : match,
  );
}
