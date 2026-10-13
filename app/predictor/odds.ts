import type { Odds } from "./types";

export type MarketGroup = "main" | "goals" | "handicap" | "halves" | "score" | "corners" | "players";
export type OddsCell = { id: string; label: string; price: number | null };
export type OddsMarket = { key: string; title: string; group: MarketGroup; cols: 1 | 2 | 3 | 4; cells: OddsCell[] };

/** Category tabs above the markets, in display order. */
export const MARKET_GROUPS: { key: MarketGroup; label: string }[] = [
  { key: "main", label: "Main" },
  { key: "goals", label: "Goals" },
  { key: "handicap", label: "Handicap" },
  { key: "halves", label: "Halves" },
  { key: "score", label: "Correct score" },
  { key: "corners", label: "Corners" },
  { key: "players", label: "Players" },
];

/** Correct-score and scorer prices shown, shortest first; the long tail adds noise. */
export const CORRECT_SCORE_LIMIT = 12;
export const SCORER_LIMIT = 20;

export const HT_FT_ORDER = ["1/1", "1/X", "1/2", "X/1", "X/X", "X/2", "2/1", "2/X", "2/2"];

export const lineValue = (line: string) => Number.parseFloat(line);
export const byLine = <T,>(entries: [string, T][]) => entries.sort(([a], [b]) => lineValue(a) - lineValue(b));
const byPrice = (entries: [string, number][]) => entries.filter(([, price]) => price != null).sort(([, a], [, b]) => a - b);

/** "+0.5" / "-1" / "0": the sign is always shown so a handicap reads at a glance. */
export function signedLine(line: number): string {
  if (line === 0) return "0";
  return line > 0 ? `+${line}` : `${line}`;
}

function cells(key: string, items: [string, number | null | undefined][]): OddsCell[] {
  return items.map(([label, price]) => ({ id: `${key}:${label}`, label, price: price ?? null }));
}

/** Over/under pairs, one row per line, skipping lines with no price at all. */
function overUnder(key: string, lines: [string, number | null | undefined, number | null | undefined][]): OddsCell[] {
  return cells(key, lines
    .filter(([, over, under]) => over != null || under != null)
    .flatMap(([line, over, under]): [string, number | null | undefined][] => [[`Over ${line}`, over], [`Under ${line}`, under]]));
}

/** Group a bookmaker snapshot into display markets. A market the bookmaker
 *  did not quote is left out entirely rather than shown as a row of dashes. */
export function oddsMarkets(odds: Partial<Odds>): OddsMarket[] {
  const markets: OddsMarket[] = [
    { key: "result", title: "Match result", group: "main", cols: 3,
      cells: cells("result", [["1", odds.home_win], ["X", odds.draw], ["2", odds.away_win]]) },
    { key: "double_chance", title: "Double chance", group: "main", cols: 3,
      cells: cells("double_chance", [["1X", odds.dc_1x], ["12", odds.dc_12], ["X2", odds.dc_x2]]) },
    { key: "draw_no_bet", title: "Draw no bet", group: "main", cols: 2,
      cells: cells("draw_no_bet", [["1", odds.dnb_home], ["2", odds.dnb_away]]) },
    { key: "btts", title: "Both teams to score", group: "main", cols: 2,
      cells: cells("btts", [["Yes", odds.btts_yes], ["No", odds.btts_no]]) },
    { key: "goals", title: "Total goals", group: "goals", cols: 2, cells: overUnder("goals", [
      ["1.5", odds.over_15, odds.under_15],
      ["2.5", odds.over_25, odds.under_25],
      ["3.5", odds.over_35, odds.under_35],
    ]) },
    { key: "asian_handicap", title: "Asian handicap", group: "handicap", cols: 2, cells: cells("asian_handicap",
      byLine(Object.entries(odds.asian_handicap ?? {}))
        .filter(([, prices]) => prices?.home != null || prices?.away != null)
        .flatMap(([line, prices]): [string, number | null | undefined][] => [
          [`1 (${signedLine(lineValue(line))})`, prices?.home],
          [`2 (${signedLine(-lineValue(line))})`, prices?.away],
        ])) },
    { key: "ht_ft", title: "Half-time / full-time", group: "halves", cols: 3,
      cells: cells("ht_ft", HT_FT_ORDER.map((pair) => [pair, odds.ht_ft?.[pair]])) },
    { key: "correct_score", title: "Correct score", group: "score", cols: 3,
      cells: cells("correct_score", byPrice(Object.entries(odds.correct_score ?? {})).slice(0, CORRECT_SCORE_LIMIT)) },
    { key: "corners", title: "Total corners", group: "corners", cols: 2, cells: overUnder("corners",
      byLine(Object.entries(odds.corners_lines ?? {})).map(([line, prices]) => [line, prices?.over, prices?.under])) },
    { key: "anytime_scorer", title: "Anytime goalscorer", group: "players", cols: 1,
      cells: cells("anytime_scorer", byPrice(Object.entries(odds.anytime_scorer ?? {})).slice(0, SCORER_LIMIT)) },
  ];
  return markets.filter((market) => market.cells.some((cell) => cell.price != null));
}
