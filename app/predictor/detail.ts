export type {
  FormResult,
  H2HMatch,
  Incident,
  Lineups,
  MatchDetail,
  MatchStats,
  TeamForm,
} from "./types";

import type { FormResult, Incident, MatchStats } from "./types";

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
