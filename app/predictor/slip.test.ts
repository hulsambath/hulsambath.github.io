import { describe, expect, it } from "vitest";
import { parseSlip, potentialReturn, togglePick, totalOdds, type SlipPick } from "./slip";

const pick = (matchId: number, cellId: string, price: number): SlipPick => ({
  matchId, matchLabel: `Match ${matchId}`, cellId, marketTitle: "Match result", label: cellId, price,
});

describe("bet slip", () => {
  it("adds, replaces within a match, and removes on a second tap", () => {
    let picks = togglePick([], pick(1, "result:1", 2));
    picks = togglePick(picks, pick(2, "btts:Yes", 1.8));
    expect(picks.map((p) => p.cellId)).toEqual(["result:1", "btts:Yes"]);

    picks = togglePick(picks, pick(1, "result:X", 3.4));   // same match: replaced, order kept
    expect(picks.map((p) => p.cellId)).toEqual(["result:X", "btts:Yes"]);

    picks = togglePick(picks, pick(1, "result:X", 3.4));   // same price: removed
    expect(picks.map((p) => p.matchId)).toEqual([2]);
  });

  it("multiplies prices and rounds the return to cents", () => {
    const picks = [pick(1, "a", 2), pick(2, "b", 1.85)];
    expect(totalOdds(picks)).toBeCloseTo(3.7);
    expect(potentialReturn(picks, 10)).toBe(37);
    expect(totalOdds([])).toBeNull();
    expect(potentialReturn(picks, 0)).toBeNull();
    expect(potentialReturn(picks, Number.NaN)).toBeNull();
  });

  it("drops malformed stored picks", () => {
    const raw = JSON.stringify([pick(1, "a", 2), { matchId: "x" }, { ...pick(3, "c", 1.5), price: 0.5 }]);
    expect(parseSlip(raw).map((p) => p.matchId)).toEqual([1]);
    expect(parseSlip("{not json")).toEqual([]);
    expect(parseSlip(null)).toEqual([]);
  });
});
