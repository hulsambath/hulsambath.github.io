import { describe, expect, it } from "vitest";
import byDate from "./fixtures/by-date.json";
import { eventNeedsSnapshot, matchVersionMap, needsRefetchForEvent, patchMatchVersion, shouldRefreshSelectedDay } from "./realtime";

describe("predictor API contract fixture", () => {
  it("keeps the board fields consumed by the portal", () => {
    const match = byDate[0];
    expect(match).toMatchObject({
      id: expect.any(Number),
      source: expect.any(String),
      version: expect.any(Number),
      league_id: expect.any(Number),
      kickoff_utc: expect.any(String),
      status: expect.any(String),
      home_team: { id: expect.any(Number), name: expect.any(String) },
      away_team: { id: expect.any(Number), name: expect.any(String) },
      prediction: {
        model_version: expect.any(String),
        created_at: expect.any(String),
        p_home: expect.any(Number),
        p_draw: expect.any(Number),
        p_away: expect.any(Number),
      },
      odds: {
        bookmaker: expect.any(String),
        captured_at: expect.any(String),
        home_win: expect.any(Number),
        draw: expect.any(Number),
        away_win: expect.any(Number),
      },
    });
  });
});

describe("WebSocket v2 invalidation contract", () => {
  it("patches a single next-version event and refetches on gaps", () => {
    const first = byDate[0];
    expect(first).toBeTruthy();
    const matches = [{ ...first!, version: 3 }];
    const matchId = matches[0]!.id;
    const message = { type: "match.updated", match_id: matchId, version: 4 };
    expect(shouldRefreshSelectedDay(message, "2026-07-15", "2026-07-15"))
      .toBe(true);
    expect(shouldRefreshSelectedDay(message, "2026-07-16", "2026-07-15"))
      .toBe(false);
    expect(matchVersionMap(matches).get(matchId)).toBe(3);
    expect(needsRefetchForEvent(matches, message)).toBe(false);
    expect(patchMatchVersion(matches, message)[0]?.version).toBe(4);
    expect(needsRefetchForEvent(matches, { type: "match.updated", match_id: matchId, version: 6 })).toBe(true);
    expect(eventNeedsSnapshot({ type: "prediction.updated", match_id: matchId, version: 4 })).toBe(true);
    expect(eventNeedsSnapshot({ type: "odds.updated", match_id: matchId, version: 4 })).toBe(true);
    expect(eventNeedsSnapshot({ type: "score.updated", match_id: matchId, version: 4 })).toBe(false);
  });
});
