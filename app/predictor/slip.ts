/** Accumulator bet slip: one pick per match, combined by multiplying prices.
 *  Picks from the same match are correlated, so a second pick from a match
 *  replaces the first instead of stacking. Nothing here places a bet. */

export const SLIP_KEY = "predictor:bet-slip";

export type SlipPick = {
  matchId: number;
  matchLabel: string;
  cellId: string;
  marketTitle: string;
  label: string;
  price: number;
};

/** Tap behaviour: the same price again removes it, any other price from that
 *  match replaces the match's pick, a new match is appended. */
export function togglePick(picks: SlipPick[], pick: SlipPick): SlipPick[] {
  const current = picks.find((p) => p.matchId === pick.matchId);
  if (current?.cellId === pick.cellId) return picks.filter((p) => p.matchId !== pick.matchId);
  if (current) return picks.map((p) => (p.matchId === pick.matchId ? pick : p));
  return [...picks, pick];
}

export function totalOdds(picks: SlipPick[]): number | null {
  if (picks.length === 0) return null;
  return picks.reduce((total, pick) => total * pick.price, 1);
}

/** Potential return for a stake, or null when the stake is not a positive number. */
export function potentialReturn(picks: SlipPick[], stake: number): number | null {
  const odds = totalOdds(picks);
  if (odds == null || !Number.isFinite(stake) || stake <= 0) return null;
  return Math.round(stake * odds * 100) / 100;
}

function isPick(value: unknown): value is SlipPick {
  const p = value as SlipPick;
  return typeof p === "object" && p != null
    && Number.isInteger(p.matchId) && typeof p.matchLabel === "string"
    && typeof p.cellId === "string" && typeof p.marketTitle === "string"
    && typeof p.label === "string" && typeof p.price === "number" && p.price > 1;
}

export function parseSlip(raw: string | null): SlipPick[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPick) : [];
  } catch {
    return [];
  }
}
