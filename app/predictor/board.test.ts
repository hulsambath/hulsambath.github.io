import { describe, expect, it } from "vitest";
import {
  classify,
  countryFlag,
  dataBadges,
  groupByCompetition,
  isFinished,
  isKickoffSoon,
  isLive,
  latestRefreshLabel,
  marketImplied,
  modelEdge,
  outcomeProbs,
  parseFavourites,
  serializeFavourites,
  visibleCompetitions,
} from "./board";

describe("favourites storage", () => {
  it("parses a JSON array of ids, tolerating garbage", () => {
    expect([...parseFavourites("[1,2,3]")]).toEqual([1, 2, 3]);
    expect([...parseFavourites(null)]).toEqual([]);
    expect([...parseFavourites("not json")]).toEqual([]);
    expect([...parseFavourites('["x", 4]')]).toEqual([4]);
  });
  it("round-trips through serialize", () => {
    expect([...parseFavourites(serializeFavourites(new Set([5, 6])))]).toEqual([5, 6]);
  });
});

const _g = (id: number, name: string, country: string, live: number, up: number) => ({
  league: { id, name, country },
  matches: [] as { id: number; league_id: number; status: string }[],
  counts: { live, finished: 0, upcoming: up, total: live + up },
});

describe("visibleCompetitions", () => {
  const groups = [
    _g(1, "Premier League", "England", 0, 2),
    _g(2, "Serie B", "Brazil", 3, 0),
    _g(3, "Copa", "Argentina", 0, 0),
  ];
  it("keeps only competitions with matches in the active status", () => {
    const live = visibleCompetitions(groups, { status: "live", favourites: new Set(), onlyFavourites: false });
    expect(live.map((x) => x.league.id)).toEqual([2]);
  });
  it("pins favourites first, then sorts by country then name", () => {
    const up = visibleCompetitions(groups, { status: "upcoming", favourites: new Set([1]), onlyFavourites: false });
    expect(up.map((x) => x.league.id)).toEqual([1]);
  });
  it("restricts to favourites when onlyFavourites", () => {
    const favs = visibleCompetitions(groups, { status: "live", favourites: new Set([1]), onlyFavourites: true });
    expect(favs).toHaveLength(0);
  });
  it("filters by predictions, odds, top leagues, and kickoff soon", () => {
    const now = new Date("2026-07-15T10:00:00Z");
    const rich = {
      league: { id: 1, name: "Premier League", country: "England" },
      matches: [
        { id: 1, league_id: 1, status: "NS", kickoff_utc: "2026-07-15T11:00:00Z", prediction: {}, odds: {} },
        { id: 2, league_id: 1, status: "NS", kickoff_utc: "2026-07-15T16:00:00Z", prediction: null, odds: {} },
      ],
      counts: { live: 0, finished: 0, upcoming: 2, total: 2 },
    };
    const result = visibleCompetitions([rich], {
      status: "upcoming",
      favourites: new Set(),
      onlyFavourites: false,
      quickFilters: new Set(["top", "predictions", "odds", "soon"]),
      topLeagueIds: new Set([1]),
      now,
    });
    expect(result[0].matches.map((m) => m.id)).toEqual([1]);
  });
});

const _leagues = new Map([
  [1, { id: 1, name: "Premier League", country: "England" }],
  [2, { id: 2, name: "Serie B", country: "Brazil" }],
]);

describe("groupByCompetition", () => {
  it("groups matches by league with per-status counts", () => {
    const matches = [
      { id: 10, league_id: 1, status: "1H" },
      { id: 11, league_id: 1, status: "FT" },
      { id: 12, league_id: 2, status: "NS" },
    ];
    const groups = groupByCompetition(matches, _leagues);
    const pl = groups.find((g) => g.league.id === 1)!;
    expect(pl.matches).toHaveLength(2);
    expect(pl.counts).toEqual({ live: 1, finished: 1, upcoming: 0, total: 2 });
    const b = groups.find((g) => g.league.id === 2)!;
    expect(b.counts).toEqual({ live: 0, finished: 0, upcoming: 1, total: 1 });
  });
  it("synthesizes a placeholder league when id is unknown", () => {
    const groups = groupByCompetition([{ id: 9, league_id: 99, status: "NS" }], _leagues);
    expect(groups[0].league.name).toBe("League 99");
  });
});

describe("countryFlag", () => {
  it("maps known countries to emoji flags", () => {
    expect(countryFlag("England")).toBe("🏴󠁧󠁢󠁥󠁮󠁧󠁿");
    expect(countryFlag("Brazil")).toBe("🇧🇷");
    expect(countryFlag("Argentina")).toBe("🇦🇷");
  });
  it("returns null for unknown / region names", () => {
    expect(countryFlag("World")).toBeNull();
    expect(countryFlag(null)).toBeNull();
    expect(countryFlag("International")).toBeNull();
  });
});

describe("status classification", () => {
  it("treats FT/AET/PEN as finished", () => {
    expect(isFinished("FT")).toBe(true);
    expect(classify("AET")).toBe("finished");
  });
  it("treats NS/PST/CANC as upcoming (not live)", () => {
    expect(isLive("NS")).toBe(false);
    expect(classify("NS")).toBe("upcoming");
    expect(classify("PST")).toBe("upcoming");
  });
  it("treats in-progress codes as live", () => {
    expect(isLive("1H")).toBe(true);
    expect(classify("HT")).toBe("live");
  });
});

describe("board display helpers", () => {
  it("calculates model probabilities before market implied probabilities", () => {
    const probs = outcomeProbs(
      { p_home: 0.5, p_draw: 0.25, p_away: 0.25 },
      { home_win: 2, draw: 3, away_win: 4 },
    );
    expect(probs).toEqual({ p1: 0.5, px: 0.25, p2: 0.25, from: "model" });
  });
  it("normalizes odds into market implied probabilities", () => {
    const probs = marketImplied({ home_win: 2, draw: 4, away_win: 4 })!;
    expect(probs.p1).toBeCloseTo(0.5);
    expect(probs.px).toBeCloseTo(0.25);
    expect(probs.p2).toBeCloseTo(0.25);
  });
  it("returns the strongest model edge when odds exist", () => {
    const edge = modelEdge(
      { p_home: 0.6, p_draw: 0.2, p_away: 0.2 },
      { home_win: 2, draw: 4, away_win: 4 },
    )!;
    expect(edge.pick).toBe("1");
    expect(edge.edge).toBeCloseTo(0.1);
  });
  it("builds availability badges and kickoff-soon state", () => {
    expect(dataBadges({ id: 1, league_id: 1, status: "NS" })).toEqual(["Pending"]);
    expect(dataBadges({ id: 1, league_id: 1, status: "1H", prediction: {}, odds: {} })).toEqual(["Predicted", "Odds", "Live"]);
    expect(isKickoffSoon(
      { id: 1, league_id: 1, status: "NS", kickoff_utc: "2026-07-15T11:30:00Z" },
      new Date("2026-07-15T10:00:00Z"),
    )).toBe(true);
  });
  it("labels refresh age compactly", () => {
    expect(latestRefreshLabel(new Date("2026-07-15T10:00:10Z"), new Date("2026-07-15T10:00:20Z"))).toBe("Updated 10s ago");
    expect(latestRefreshLabel(new Date("2026-07-15T09:00:00Z"), new Date("2026-07-15T10:00:00Z"))).toBe("Updated 1h ago");
  });
});
