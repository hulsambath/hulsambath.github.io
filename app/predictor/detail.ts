export type FormResult = "W" | "D" | "L";
export type Incident = { minute: number | null; type: "goal" | "card"; team: "home" | "away"; player: string | null; detail: string | null };
export type H2HMatch = { date: string | null; homeName: string | null; awayName: string | null; homeGoals: number | null; awayGoals: number | null };
export type LineupPlayer = { name: string | null; number: number | null; position: string | null; isStarter: boolean };
export type Lineups = { formationHome: string | null; formationAway: string | null; home: LineupPlayer[]; away: LineupPlayer[] };
export type TeamForm = { recent: { date: string | null; opp: string | null; gf: number | null; ga: number | null; result: FormResult }[]; next: { date: string | null; opp: string | null } | null };
export type MatchStats = Record<string, number | null>;
export type MatchDetail = {
  match: unknown;
  stats: MatchStats | null;
  lineups: Lineups | null;
  incidents: Incident[] | null;
  h2h: H2HMatch[] | null;
  home_form: TeamForm | null;
  away_form: TeamForm | null;
  prediction?: unknown;
  odds?: unknown;
};

export function formChip(result: FormResult): { label: string; cls: string } {
  const cls = result === "W" ? "bg-[hsl(var(--home)/0.2)] text-[hsl(var(--home))]"
    : result === "L" ? "bg-[hsl(var(--away)/0.2)] text-[hsl(var(--away))]"
    : "bg-muted text-muted-foreground";
  return { label: result, cls };
}

export function groupIncidents(incidents: Incident[]): { home: Incident[]; away: Incident[] } {
  return {
    home: incidents.filter((i) => i.team === "home"),
    away: incidents.filter((i) => i.team === "away"),
  };
}

const STAT_LABELS: [string, string][] = [
  ["possession", "Possession"], ["shots", "Shots"],
  ["shots_on_target", "Shots on target"], ["corners", "Corners"], ["xg", "xG"],
];

export function statRows(stats: MatchStats | null): { label: string; home: number | null; away: number | null }[] {
  if (!stats) return [];
  const rows: { label: string; home: number | null; away: number | null }[] = [];
  for (const [key, label] of STAT_LABELS) {
    const home = stats[`home_${key}`] ?? null;
    const away = stats[`away_${key}`] ?? null;
    if (home == null && away == null) continue;
    rows.push({ label, home, away });
  }
  return rows;
}
