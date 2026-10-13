import { describe, expect, it } from "vitest";
import { CORRECT_SCORE_LIMIT, SCORER_LIMIT, oddsMarkets, signedLine } from "./odds";

const market = (odds: Parameters<typeof oddsMarkets>[0], key: string) =>
  oddsMarkets(odds).find((m) => m.key === key);

describe("oddsMarkets", () => {
  it("keeps only the markets the bookmaker quoted", () => {
    const markets = oddsMarkets({ home_win: 1.8, draw: 3.6, away_win: 4.5, over_25: 1.9, under_25: 1.95 });
    expect(markets.map((m) => [m.key, m.group])).toEqual([["result", "main"], ["goals", "goals"]]);
    expect(markets[1]?.cells.map((c) => c.label)).toEqual(["Over 2.5", "Under 2.5"]);
    expect(markets[0]?.cells[0]?.id).toBe("result:1");
  });

  it("lays out double chance, draw no bet and every quoted goal line", () => {
    const odds = {
      dc_1x: 1.2, dc_12: 1.3, dc_x2: 1.9, dnb_home: 1.5, dnb_away: 2.4,
      over_15: 1.28, under_15: 3.4, over_35: 3.1, under_35: 1.35,
    };
    expect(market(odds, "double_chance")?.cells.map((c) => c.price)).toEqual([1.2, 1.3, 1.9]);
    expect(market(odds, "draw_no_bet")?.cells.map((c) => c.label)).toEqual(["1", "2"]);
    // the unquoted 2.5 line is skipped, not rendered as dashes
    expect(market(odds, "goals")?.cells.map((c) => c.label))
      .toEqual(["Over 1.5", "Under 1.5", "Over 3.5", "Under 3.5"]);
  });

  it("labels each handicap side with its own signed line", () => {
    const m = market({ asian_handicap: {
      "0.5": { home: 2.6, away: 1.5 }, "-0.5": { home: 1.9, away: 1.95 }, "0": { home: 1.6 },
    } }, "asian_handicap");
    expect(m?.cells.map((c) => c.label)).toEqual(["1 (-0.5)", "2 (+0.5)", "1 (0)", "2 (0)", "1 (+0.5)", "2 (-0.5)"]);
    expect(m?.cells[3]?.price).toBeNull();
    expect(signedLine(1.25)).toBe("+1.25");
  });

  it("orders half-time/full-time pairs home, draw, away", () => {
    const m = market({ ht_ft: { "2/2": 5, "1/1": 2.9, "X/1": 4.5 } }, "ht_ft");
    expect(m?.cols).toBe(3);
    expect(m?.cells).toHaveLength(9);
    expect(m?.cells.filter((c) => c.price != null).map((c) => c.label)).toEqual(["1/1", "X/1", "2/2"]);
  });

  it("sorts correct scores and scorers by price and caps both lists", () => {
    const many = (prefix: string) =>
      Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`${prefix}${i}`, 40 - i]));
    const scores = market({ correct_score: { ...many("s"), "1-1": 6.5 } }, "correct_score");
    expect(scores?.cells).toHaveLength(CORRECT_SCORE_LIMIT);
    expect(scores?.cells[0]).toMatchObject({ label: "1-1", price: 6.5 });
    const scorers = market({ anytime_scorer: { ...many("Player "), Haaland: 1.6 } }, "anytime_scorer");
    expect(scorers?.cells).toHaveLength(SCORER_LIMIT);
    expect(scorers?.cells[0]?.label).toBe("Haaland");
  });

  it("orders corner lines numerically and keeps one-sided lines", () => {
    const m = market({
      corners_lines: { "10.5": { over: 2.3 }, "8.5": { over: 1.6, under: 2.2 }, "9.5": { over: 1.85, under: 1.95 } },
    }, "corners");
    expect(m?.cells.map((c) => c.label))
      .toEqual(["Over 8.5", "Under 8.5", "Over 9.5", "Under 9.5", "Over 10.5", "Under 10.5"]);
    expect(m?.cells.at(-1)?.price).toBeNull();
  });

  it("returns nothing for an empty snapshot", () => {
    expect(oddsMarkets({ bookmaker: "1xbet", correct_score: {}, corners_lines: null, ht_ft: {} })).toEqual([]);
  });
});
