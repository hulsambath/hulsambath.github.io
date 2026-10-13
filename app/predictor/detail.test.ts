import { describe, expect, it } from "vitest";
import { formChip, groupIncidents, h2hDate, h2hRows, initialsFor, statRows } from "./detail";

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
    expect(g.away[0]?.player).toBe("B");
  });
  it("builds paired stat rows, skipping all-null stats", () => {
    const rows = statRows({ home_possession: 60, away_possession: 40, home_shots: null, away_shots: null });
    expect(rows.find((r) => r.label === "Possession")).toBeTruthy();
    expect(rows.find((r) => r.label === "Shots")).toBeUndefined();
  });
});

describe("head-to-head helpers", () => {
  it("formats the H2H date in the project timezone", () => {
    expect(h2hDate("2026-05-01T15:00:00Z")).toBe("1 May 2026");
    expect(h2hDate("2026-05-01T20:00:00Z")).toBe("2 May 2026");   // already 2 May in Phnom Penh
  });
  it("h2hDate rejects null and garbage", () => {
    expect(h2hDate(null)).toBeNull();
    expect(h2hDate("not a date")).toBeNull();
  });
  it("h2hRows tolerates rows without logos", () => {
    const rows = h2hRows([{ date: null, homeName: "A", awayName: null, homeGoals: 1, awayGoals: 0 }]);
    expect(rows[0]).toMatchObject({
      date: null,
      home: { name: "A", logo: null, goals: 1 },
      away: { name: "Unknown", logo: null, goals: 0 },
    });
  });
  it("h2hRows keeps provider logos and caps the list", () => {
    const row = { date: "2026-05-01T15:00:00Z", homeName: "A", awayName: "B", homeGoals: 2, awayGoals: 2,
      homeLogo: "https://a.espncdn.com/x.png", awayLogo: null };
    const rows = h2hRows(Array.from({ length: 10 }, () => row));
    expect(rows).toHaveLength(8);
    expect(rows[0]?.home.logo).toBe("https://a.espncdn.com/x.png");
    expect(rows[0]?.date).toBe("1 May 2026");
    expect(new Set(rows.map((r) => r.key)).size).toBe(8);
  });
  it("initialsFor falls back to ?", () => {
    expect(initialsFor("Kyoto Sanga")).toBe("KS");
    expect(initialsFor("***")).toBe("?");
  });
});
