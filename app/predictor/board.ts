export type StatusFilter = "live" | "finished" | "upcoming";

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

export type BoardLeague = { id: number; name: string; country: string | null };
export type BoardMatch = { id: number; league_id: number; status: string };

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
  opts: { status: StatusFilter; favourites: Set<number>; onlyFavourites: boolean; leagueId?: number | null },
): CompetitionGroup<T>[] {
  const { status, favourites, onlyFavourites, leagueId } = opts;
  return groups
    .filter((g) => g.counts[status] > 0)
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
