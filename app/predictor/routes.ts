/** The board's URL state: `/predictor?date=YYYY-MM-DD&match=<id>`. Keeping it
 *  on one route means opening a match never unmounts the board, Back closes
 *  the detail view, and a reload or shared link restores the same day. */
export type BoardParams = { date: string | null; matchId: number | null };

const ISO_DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function parseBoardParams(params: Pick<URLSearchParams, "get">): BoardParams {
  const date = params.get("date");
  const match = params.get("match");
  const matchId = match && /^\d+$/.test(match) ? Number(match) : NaN;
  return {
    date: date && ISO_DAY.test(date) ? date : null,
    matchId: Number.isSafeInteger(matchId) && matchId > 0 ? matchId : null,
  };
}

export function boardHref({ date, matchId }: { date?: string | null; matchId?: number | null }): string {
  const qs = new URLSearchParams();
  if (date) qs.set("date", date);
  if (matchId != null) qs.set("match", String(matchId));
  const query = qs.toString();
  return query ? `/predictor?${query}` : "/predictor";
}
