export type {
  FormResult,
  H2HMatch,
  Incident,
  Lineups,
  MatchDetail,
  MatchStats,
  TeamForm,
} from "./types";

import type { FormResult, H2HMatch, Incident, MatchStats } from "./types";

/** Day buckets are Phnom Penh time across the predictor; H2H dates follow. */
const H2H_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Phnom_Penh",
});

export function initialsFor(name: string): string {
  return name.replace(/[^A-Za-z0-9 ]/g, "").split(" ")
    .filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

export function h2hDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : H2H_DATE.format(date);
}

export type H2HSide = { name: string; logo: string | null; goals: number | null };
export type H2HRow = { key: string; date: string | null; home: H2HSide; away: H2HSide };

export function h2hRows(h2h: H2HMatch[] | null, limit = 8): H2HRow[] {
  return (h2h ?? []).slice(0, limit).map((m, i) => ({
    key: `${m.date ?? "nodate"}-${i}`,
    date: h2hDate(m.date),
    home: { name: m.homeName ?? "Unknown", logo: m.homeLogo ?? null, goals: m.homeGoals },
    away: { name: m.awayName ?? "Unknown", logo: m.awayLogo ?? null, goals: m.awayGoals },
  }));
}

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
