import { byLine, CORRECT_SCORE_LIMIT, HT_FT_ORDER, lineValue, signedLine, type MarketGroup } from "./odds";
import type { ModelMarkets, OverUnder } from "./types";

export type ModelCell = { id: string; label: string; p: number };
export type ModelMarket = { key: string; title: string; group: MarketGroup; cols: 1 | 2 | 3 | 4; cells: ModelCell[] };

function cells(key: string, items: [string, number | undefined][]): ModelCell[] {
  return items
    .filter((item): item is [string, number] => typeof item[1] === "number")
    .map(([label, p]) => ({ id: `${key}:${label}`, label, p }));
}

function overUnder(key: string, lines: Record<string, OverUnder> | undefined): ModelCell[] {
  return cells(key, byLine(Object.entries(lines ?? {}))
    .flatMap(([line, v]): [string, number | undefined][] => [[`Over ${line}`, v?.over], [`Under ${line}`, v?.under]]));
}

/** Every model-priced market, ids matching odds.ts cells so a probability
 *  lines up with a bookmaker price. Markets with no cells are dropped. */
export function modelMarkets(m: ModelMarkets | null | undefined, names: { home: string; away: string }): ModelMarket[] {
  if (!m) return [];
  const list: ModelMarket[] = [
    { key: "result", title: "Match result", group: "main", cols: 3,
      cells: cells("result", [["1", m.result?.["1"]], ["X", m.result?.X], ["2", m.result?.["2"]]]) },
    { key: "double_chance", title: "Double chance", group: "main", cols: 3,
      cells: cells("double_chance", [["1X", m.double_chance?.["1X"]], ["12", m.double_chance?.["12"]], ["X2", m.double_chance?.X2]]) },
    { key: "draw_no_bet", title: "Draw no bet", group: "main", cols: 2,
      cells: cells("draw_no_bet", [["1", m.draw_no_bet?.["1"]], ["2", m.draw_no_bet?.["2"]]]) },
    { key: "btts", title: "Both teams to score", group: "main", cols: 2,
      cells: cells("btts", [["Yes", m.btts?.Yes], ["No", m.btts?.No]]) },
    { key: "goals", title: "Total goals", group: "goals", cols: 2, cells: overUnder("goals", m.goals) },
    { key: "home_goals", title: `${names.home} total goals`, group: "goals", cols: 2, cells: overUnder("home_goals", m.home_goals) },
    { key: "away_goals", title: `${names.away} total goals`, group: "goals", cols: 2, cells: overUnder("away_goals", m.away_goals) },
    { key: "asian_handicap", title: "Asian handicap", group: "handicap", cols: 2, cells: cells("asian_handicap",
      byLine(Object.entries(m.asian_handicap ?? {})).flatMap(([line, p]): [string, number | undefined][] => [
        [`1 (${signedLine(lineValue(line))})`, p?.home],
        [`2 (${signedLine(-lineValue(line))})`, p?.away],
      ])) },
    { key: "ht_ft", title: "Half-time / full-time", group: "halves", cols: 3,
      cells: cells("ht_ft", HT_FT_ORDER.map((pair) => [pair, m.ht_ft?.[pair]])) },
    { key: "correct_score", title: "Correct score", group: "score", cols: 3, cells: cells("correct_score",
      Object.entries(m.correct_score ?? {}).sort(([, a], [, b]) => b - a).slice(0, CORRECT_SCORE_LIMIT)) },
  ];
  return list.filter((market) => market.cells.length > 0);
}

/** cell id → model probability, for annotating bookmaker prices. Team names
 *  only affect titles, never ids, so placeholders are fine here. */
export function modelProbabilityByCell(m: ModelMarkets | null | undefined): Map<string, number> {
  return new Map(modelMarkets(m, { home: "", away: "" }).flatMap((market) => market.cells.map((c) => [c.id, c.p] as const)));
}

export const fairOdds = (p: number): number | null => (p > 0 ? 1 / p : null);

/** Expected return per unit staked at `price` if the model is right; > 0 is value. */
export function edge(price: number | null | undefined, p: number | undefined): number | null {
  return price == null || p == null ? null : price * p - 1;
}

/** Edge needed before a price is flagged as value. The model is not calibrated
 *  against bookmaker margins, so small positive edges are mostly noise. */
export const VALUE_EDGE = 0.05;

export function isValue(price: number | null | undefined, p: number | undefined): boolean {
  const e = edge(price, p);
  return e != null && e > VALUE_EDGE;
}
