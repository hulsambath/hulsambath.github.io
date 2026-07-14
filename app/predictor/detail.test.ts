import { describe, expect, it } from "vitest";
import { formChip, groupIncidents, statRows } from "./detail";

describe("detail helpers", () => {
  it("maps form result to a chip class", () => {
    expect(formChip("W").label).toBe("W");
    expect(formChip("L").cls).toContain("away");
    expect(formChip("D").label).toBe("D");
  });
  it("splits incidents by team preserving order", () => {
    const g = groupIncidents([
      { minute: 10, type: "goal", team: "home", player: "A", detail: null },
      { minute: 20, type: "card", team: "away", player: "B", detail: "yellow" },
    ]);
    expect(g.home).toHaveLength(1);
    expect(g.away[0].player).toBe("B");
  });
  it("builds paired stat rows, skipping all-null stats", () => {
    const rows = statRows({ home_possession: 60, away_possession: 40, home_shots: null, away_shots: null });
    expect(rows.find((r) => r.label === "Possession")).toBeTruthy();
    expect(rows.find((r) => r.label === "Shots")).toBeUndefined();
  });
});
