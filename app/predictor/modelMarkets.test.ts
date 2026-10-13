import { describe, expect, it } from "vitest";
import { oddsMarkets } from "./odds";
import { edge, fairOdds, isValue, modelMarkets, modelProbabilityByCell } from "./modelMarkets";
import type { ModelMarkets } from "./types";

const MARKETS: ModelMarkets = {
  result: { "1": 0.5, X: 0.27, "2": 0.23 },
  double_chance: { "1X": 0.77, "12": 0.73, X2: 0.5 },
  draw_no_bet: { "1": 0.685, "2": 0.315 },
  btts: { Yes: 0.53, No: 0.47 },
  goals: { "1.5": { over: 0.75, under: 0.25 }, "2.5": { over: 0.51, under: 0.49 } },
  home_goals: { "0.5": { over: 0.8, under: 0.2 }, "1.5": { over: 0.47, under: 0.53 } },
  away_goals: { "0.5": { over: 0.67, under: 0.33 } },
  asian_handicap: { "-0.5": { home: 0.5, away: 0.5 }, "0": { home: 0.685, away: 0.315 } },
  ht_ft: { "1/1": 0.3, "X/1": 0.15 },
  correct_score: { "1-0": 0.1, "2-1": 0.09, "0-0": 0.07 },
};

describe("model markets", () => {
  it("uses the same cell ids as bookmaker odds", () => {
    const priced = oddsMarkets({
      home_win: 2, draw: 3.4, away_win: 4, over_25: 1.9, under_25: 1.9,
      asian_handicap: { "-0.5": { home: 2, away: 1.85 } },
      ht_ft: { "1/1": 3.2 }, correct_score: { "2-1": 9 },
    });
    const model = modelProbabilityByCell(MARKETS);
    const ids = priced.flatMap((m) => m.cells.map((c) => c.id));
    for (const id of ["result:1", "result:X", "goals:Over 2.5", "asian_handicap:1 (-0.5)",
      "asian_handicap:2 (+0.5)", "ht_ft:1/1", "correct_score:2-1"]) {
      expect(ids).toContain(id);
      expect(model.get(id)).toBeTypeOf("number");
    }
  });

  it("builds team totals (TO/TU) titled with the team names", () => {
    const list = modelMarkets(MARKETS, { home: "Kyoto", away: "Ratchaburi" });
    const home = list.find((m) => m.key === "home_goals");
    expect(home?.title).toBe("Kyoto total goals");
    expect(home?.cells.map((c) => c.label)).toEqual(["Over 0.5", "Under 0.5", "Over 1.5", "Under 1.5"]);
    expect(list.find((m) => m.key === "away_goals")?.cells[0]).toEqual(
      { id: "away_goals:Over 0.5", label: "Over 0.5", p: 0.67 });
  });

  it("orders correct scores by probability", () => {
    const cs = modelMarkets(MARKETS, { home: "H", away: "A" }).find((m) => m.key === "correct_score");
    expect(cs?.cells.map((c) => c.label)).toEqual(["1-0", "2-1", "0-0"]);
  });

  it("quarter handicap lines have no model probability", () => {
    const model = modelProbabilityByCell(MARKETS);
    expect(model.get("asian_handicap:1 (-0.25)")).toBeUndefined();
    expect(edge(1.95, model.get("asian_handicap:1 (-0.25)"))).toBeNull();
  });

  it("null markets give no model markets", () => {
    expect(modelMarkets(null, { home: "H", away: "A" })).toEqual([]);
    expect(modelProbabilityByCell(undefined).size).toBe(0);
  });

  it("computes fair odds and edge", () => {
    expect(fairOdds(0.5)).toBe(2);
    expect(fairOdds(0)).toBeNull();
    expect(edge(2.2, 0.5)).toBeCloseTo(0.1);
    expect(edge(null, 0.5)).toBeNull();
  });

  it("flags value only above the 5% edge threshold", () => {
    expect(isValue(2.2, 0.5)).toBe(true);      // +10%
    expect(isValue(2.08, 0.5)).toBe(false);    // +4%: model noise, not value
    expect(isValue(2.2, undefined)).toBe(false);
  });
});
