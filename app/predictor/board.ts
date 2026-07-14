export type StatusFilter = "live" | "finished" | "upcoming";
export type QuickFilter = "top" | "predictions" | "odds" | "soon";

export const FINISHED = new Set(["FT", "AET", "PEN"]);
export const NOT_LIVE = new Set(["NS", "PST", "CANC", "FT", "AET", "PEN"]);

export const isFinished = (s: string): boolean => FINISHED.has(s);
export const isLive = (s: string): boolean => !NOT_LIVE.has(s);

export function classify(status: string): StatusFilter {
  if (isLive(status)) return "live";
  if (isFinished(status)) return "finished";
  return "upcoming";
}

// Regional-indicator flag from a 2-letter ISO code.
function iso2ToFlag(code: string): string {
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt(0)));
}

// Country display name (as SofaScore/backend emits) → ISO2, plus a few
// custom-flag exceptions. Extend as new countries appear in /leagues.
const COUNTRY_ISO2: Record<string, string> = {
  Spain: "ES", Italy: "IT", Germany: "DE", France: "FR", Portugal: "PT",
  Netherlands: "NL", Belgium: "BE", Brazil: "BR", Argentina: "AR",
  Bolivia: "BO", Ecuador: "EC", Norway: "NO", USA: "US", Cameroon: "CM",
  Colombia: "CO", Mexico: "MX", Chile: "CL", Uruguay: "UY", Peru: "PE",
  Japan: "JP", "South Korea": "KR", Australia: "AU", Turkey: "TR",
  Scotland: "GB-SCT", Wales: "GB-WLS",
};

const CUSTOM_FLAGS: Record<string, string> = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

// Region/umbrella labels that have no national flag.
const NO_FLAG = new Set(["World", "International", "Europe", "Club", ""]);

export function countryFlag(country: string | null | undefined): string | null {
  if (!country || NO_FLAG.has(country)) return null;
  if (CUSTOM_FLAGS[country]) return CUSTOM_FLAGS[country];
  const iso = COUNTRY_ISO2[country];
  if (!iso || iso.includes("-")) return null; // subdivisions handled by CUSTOM_FLAGS
  return iso2ToFlag(iso);
}

export type BoardLeague = { id: number; api_league_id?: number; name: string; country: string | null };
export type BoardMatch = {
  id: number;
  league_id: number;
  status: string;
  kickoff_utc?: string;
  prediction?: unknown | null;
  odds?: unknown | null;
};

export type CompetitionGroup<T extends BoardMatch> = {
  league: BoardLeague;
  matches: T[];
  counts: { live: number; finished: number; upcoming: number; total: number };
};

export function groupByCompetition<T extends BoardMatch>(
  matches: T[],
  leaguesById: Map<number, BoardLeague>,
): CompetitionGroup<T>[] {
  const groups = new Map<number, CompetitionGroup<T>>();
  for (const m of matches) {
    let g = groups.get(m.league_id);
    if (!g) {
      const league = leaguesById.get(m.league_id) ??
        { id: m.league_id, name: `League ${m.league_id}`, country: null };
      g = { league, matches: [], counts: { live: 0, finished: 0, upcoming: 0, total: 0 } };
      groups.set(m.league_id, g);
    }
    g.matches.push(m);
    g.counts.total += 1;
    g.counts[classify(m.status)] += 1;
  }
  return [...groups.values()];
}

export function visibleCompetitions<T extends BoardMatch>(
  groups: CompetitionGroup<T>[],
  opts: {
    status: StatusFilter;
    favourites: Set<number>;
    onlyFavourites: boolean;
    leagueId?: number | null;
    quickFilters?: Set<QuickFilter>;
    topLeagueIds?: Set<number>;
    now?: Date;
  },
): CompetitionGroup<T>[] {
  const { status, favourites, onlyFavourites, leagueId } = opts;
  const quickFilters = opts.quickFilters ?? new Set<QuickFilter>();
  const topLeagueIds = opts.topLeagueIds ?? new Set<number>();
  const now = opts.now ?? new Date();
  return groups
    .map((g) => {
      if (g.matches.length === 0 && quickFilters.size === 0) return g;
      return {
        ...g,
        matches: g.matches.filter((m) => {
        if (classify(m.status) !== status) return false;
        if (quickFilters.has("top") && !topLeagueIds.has(g.league.id)) return false;
        if (quickFilters.has("predictions") && !m.prediction) return false;
        if (quickFilters.has("odds") && !m.odds) return false;
        if (quickFilters.has("soon") && !isKickoffSoon(m, now)) return false;
        return true;
      }),
      };
    })
    .filter((g) => g.matches.length > 0 || (g.matches.length === 0 && g.counts[status] > 0 && quickFilters.size === 0))
    .filter((g) => (leagueId == null ? true : g.league.id === leagueId))
    .filter((g) => (onlyFavourites ? favourites.has(g.league.id) : true))
    .sort((a, b) => {
      const fa = favourites.has(a.league.id) ? 0 : 1;
      const fb = favourites.has(b.league.id) ? 0 : 1;
      if (fa !== fb) return fa - fb;
      const ca = a.league.country ?? "";
      const cb = b.league.country ?? "";
      return ca.localeCompare(cb) || a.league.name.localeCompare(b.league.name);
    });
}

export function isKickoffSoon(match: BoardMatch, now = new Date()): boolean {
  if (!match.kickoff_utc || match.status !== "NS") return false;
  const kickoff = new Date(match.kickoff_utc).getTime();
  const diff = kickoff - now.getTime();
  return diff >= 0 && diff <= 2 * 60 * 60 * 1000;
}

export function dataBadges(match: BoardMatch): string[] {
  const badges: string[] = [];
  if (match.prediction) badges.push("Predicted");
  if (match.odds) badges.push("Odds");
  if (isLive(match.status)) badges.push("Live");
  if (badges.length === 0) badges.push("Pending");
  return badges;
}

export type OutcomeProbs = {
  p1: number;
  px: number;
  p2: number;
  from: "model" | "market";
};

export type PredictionLike = {
  p_home?: number | null;
  p_draw?: number | null;
  p_away?: number | null;
};

export type OddsLike = {
  home_win?: number | null;
  draw?: number | null;
  away_win?: number | null;
};

export function outcomeProbs(
  prediction?: PredictionLike | null,
  odds?: OddsLike | null,
): OutcomeProbs | null {
  if (prediction?.p_home != null && prediction.p_draw != null && prediction.p_away != null) {
    return { p1: prediction.p_home, px: prediction.p_draw, p2: prediction.p_away, from: "model" };
  }
  if (odds?.home_win && odds.draw && odds.away_win) {
    const inv = [1 / odds.home_win, 1 / odds.draw, 1 / odds.away_win];
    const total = inv[0] + inv[1] + inv[2];
    return { p1: inv[0] / total, px: inv[1] / total, p2: inv[2] / total, from: "market" };
  }
  return null;
}

export function marketImplied(odds?: OddsLike | null): OutcomeProbs | null {
  return outcomeProbs(null, odds);
}

export function modelEdge(
  prediction?: PredictionLike | null,
  odds?: OddsLike | null,
): { pick: "1" | "X" | "2"; probability: number; market: number | null; edge: number | null } | null {
  const model = outcomeProbs(prediction, null);
  if (!model) return null;
  const outcomes = [
    { pick: "1" as const, probability: model.p1 },
    { pick: "X" as const, probability: model.px },
    { pick: "2" as const, probability: model.p2 },
  ];
  const best = outcomes.reduce((a, b) => (b.probability > a.probability ? b : a));
  const market = marketImplied(odds);
  const marketValue = market
    ? best.pick === "1" ? market.p1 : best.pick === "X" ? market.px : market.p2
    : null;
  return {
    ...best,
    market: marketValue,
    edge: marketValue == null ? null : best.probability - marketValue,
  };
}

export function latestRefreshLabel(lastUpdated: Date | null, now = new Date()): string {
  if (!lastUpdated) return "Not refreshed yet";
  const seconds = Math.max(0, Math.round((now.getTime() - lastUpdated.getTime()) / 1000));
  if (seconds < 60) return `Updated ${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `Updated ${hours}h ago`;
}

export const FAVOURITES_KEY = "predictor:favourites";

export function parseFavourites(raw: string | null): Set<number> {
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((n): n is number => typeof n === "number"));
  } catch {
    return new Set();
  }
}

export function serializeFavourites(s: Set<number>): string {
  return JSON.stringify([...s]);
}
