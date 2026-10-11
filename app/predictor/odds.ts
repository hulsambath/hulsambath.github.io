import type { Odds } from "./types";

export type OddsCell = { label: string; price: number | null };
export type OddsMarket = { key: string; title: string; cols: 2 | 3 | 4; cells: OddsCell[] };

/** Correct-score prices shown, shortest first; the long tail adds noise. */
export const CORRECT_SCORE_LIMIT = 12;

const lineValue = (line: string) => Number.parseFloat(line);

/** Over/under pairs, one row per line, skipping lines with no price at all. */
function overUnderCells(lines: [string, number | null | undefined, number | null | undefined][]): OddsCell[] {
  return lines
    .filter(([, over, under]) => over != null || under != null)
    .flatMap(([line, over, under]) => [
      { label: `O${line}`, price: over ?? null },
      { label: `U${line}`, price: under ?? null },
    ]);
}

/** Group a bookmaker snapshot into display sections. A market the bookmaker
 *  did not quote is left out entirely rather than shown as a row of dashes. */
export function oddsMarkets(odds: Partial<Odds>): OddsMarket[] {
  const markets: OddsMarket[] = [
    { key: "result", title: "Match result", cols: 3, cells: [
      { label: "1", price: odds.home_win ?? null },
      { label: "X", price: odds.draw ?? null },
      { label: "2", price: odds.away_win ?? null },
    ] },
    { key: "double_chance", title: "Double chance", cols: 3, cells: [
      { label: "1X", price: odds.dc_1x ?? null },
      { label: "12", price: odds.dc_12 ?? null },
      { label: "X2", price: odds.dc_x2 ?? null },
    ] },
    { key: "draw_no_bet", title: "Draw no bet", cols: 2, cells: [
      { label: "1", price: odds.dnb_home ?? null },
      { label: "2", price: odds.dnb_away ?? null },
    ] },
    { key: "goals", title: "Total goals", cols: 2, cells: overUnderCells([
      ["1.5", odds.over_15, odds.under_15],
      ["2.5", odds.over_25, odds.under_25],
      ["3.5", odds.over_35, odds.under_35],
    ]) },
    { key: "btts", title: "Both teams to score", cols: 2, cells: [
      { label: "Yes", price: odds.btts_yes ?? null },
      { label: "No", price: odds.btts_no ?? null },
    ] },
    { key: "correct_score", title: "Correct score", cols: 4, cells: Object.entries(odds.correct_score ?? {})
      .filter(([, price]) => price != null)
      .sort(([, a], [, b]) => a - b)
      .slice(0, CORRECT_SCORE_LIMIT)
      .map(([score, price]) => ({ label: score, price })) },
    { key: "corners", title: "Total corners", cols: 2, cells: overUnderCells(
      Object.entries(odds.corners_lines ?? {})
        .sort(([a], [b]) => lineValue(a) - lineValue(b))
        .map(([line, prices]) => [line, prices?.over, prices?.under]),
    ) },
  ];
  return markets.filter((market) => market.cells.some((cell) => cell.price != null));
}
