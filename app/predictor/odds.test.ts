import { describe, expect, it } from "vitest";
import { CORRECT_SCORE_LIMIT, oddsMarkets } from "./odds";

describe("oddsMarkets", () => {
  it("keeps only the markets the bookmaker quoted", () => {
    const markets = oddsMarkets({ home_win: 1.8, draw: 3.6, away_win: 4.5, over_25: 1.9, under_25: 1.95 });
    expect(markets.map((m) => m.key)).toEqual(["result", "goals"]);
    expect(markets[1]?.cells.map((c) => c.label)).toEqual(["O2.5", "U2.5"]);
  });

  it("lays out double chance, draw no bet and every goal line", () => {
    const markets = oddsMarkets({
      dc_1x: 1.2, dc_12: 1.3, dc_x2: 1.9, dnb_home: 1.5, dnb_away: 2.4,
      over_15: 1.28, under_15: 3.4, over_35: 3.1, under_35: 1.35,
    });
    const byKey = Object.fromEntries(markets.map((m) => [m.key, m]));
    expect(byKey.double_chance?.cells.map((c) => c.price)).toEqual([1.2, 1.3, 1.9]);
    expect(byKey.draw_no_bet?.cells.map((c) => c.label)).toEqual(["1", "2"]);
    // the unquoted 2.5 line is skipped, not rendered as dashes
    expect(byKey.goals?.cells.map((c) => c.label)).toEqual(["O1.5", "U1.5", "O3.5", "U3.5"]);
  });

  it("sorts correct scores by price and caps the list", () => {
    const correct_score = Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [`${i}-0`, 30 - i]),
    );
    correct_score["1-1"] = 6.5;
    const market = oddsMarkets({ correct_score }).find((m) => m.key === "correct_score");
    expect(market?.cells).toHaveLength(CORRECT_SCORE_LIMIT);
    expect(market?.cells[0]).toEqual({ label: "1-1", price: 6.5 });
  });

  it("orders corner lines numerically and keeps one-sided lines", () => {
    const market = oddsMarkets({
      corners_lines: { "10.5": { over: 2.3 }, "8.5": { over: 1.6, under: 2.2 }, "9.5": { over: 1.85, under: 1.95 } },
    }).find((m) => m.key === "corners");
    expect(market?.cells.map((c) => c.label)).toEqual(["O8.5", "U8.5", "O9.5", "U9.5", "O10.5", "U10.5"]);
    expect(market?.cells.at(-1)?.price).toBeNull();
  });

  it("returns nothing for an empty snapshot", () => {
    expect(oddsMarkets({ bookmaker: "1xbet", correct_score: {}, corners_lines: null })).toEqual([]);
  });
});
