import { describe, expect, it } from "vitest";
import { boardHref, parseBoardParams } from "./routes";

describe("board URL state", () => {
  it("reads a valid day and match id", () => {
    const params = new URLSearchParams("date=2026-10-12&match=4688");
    expect(parseBoardParams(params)).toEqual({ date: "2026-10-12", matchId: 4688 });
  });

  it("ignores malformed values instead of guessing", () => {
    for (const qs of ["date=12-10-2026&match=abc", "date=2026-13-40&match=-3", "match=1.5", ""]) {
      const parsed = parseBoardParams(new URLSearchParams(qs));
      expect(parsed.matchId).toBeNull();
      if (!qs.includes("2026-10")) expect(parsed.date).toBeNull();
    }
    expect(parseBoardParams(new URLSearchParams("date=2026-13-40")).date).toBeNull();
  });

  it("builds board links that round-trip", () => {
    expect(boardHref({})).toBe("/predictor");
    expect(boardHref({ date: "2026-10-12" })).toBe("/predictor?date=2026-10-12");
    const href = boardHref({ date: "2026-10-12", matchId: 4688 });
    expect(href).toBe("/predictor?date=2026-10-12&match=4688");
    expect(parseBoardParams(new URLSearchParams(href.split("?")[1]))).toEqual({ date: "2026-10-12", matchId: 4688 });
  });
});
