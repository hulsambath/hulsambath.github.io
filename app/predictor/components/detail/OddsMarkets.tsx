import { neu } from "../../neu";
import { oddsMarkets } from "../../odds";
import type { Odds } from "../../types";

const COLS = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" } as const;

const odd = (v: number | null | undefined) => v == null ? "-" : v.toFixed(2);
const timestamp = (value: string | null | undefined) => value
  ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
  : null;

export function OddsMarkets({ odds }: { odds: Partial<Odds> | null }) {
  const markets = odds ? oddsMarkets(odds) : [];
  if (!odds || markets.length === 0) {
    return <p className={`${neu.inset} p-3 text-sm text-muted-foreground`}>Odds unavailable for this match.</p>;
  }
  return (
    <section className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Market odds</h3>
        <span className="font-data text-[10px] uppercase tracking-wide text-muted-foreground">
          {odds.bookmaker ?? "bookmaker"}{odds.is_closing ? " · closing" : ""}
        </span>
      </div>
      {odds.captured_at && (
        <p className="mb-2 font-data text-[10px] text-muted-foreground">Captured {timestamp(odds.captured_at)}</p>
      )}
      <div className="space-y-3">
        {markets.map((market) => (
          <div key={market.key} className={`${neu.inset} p-2.5`}>
            <div className="mb-1.5 font-data text-[10px] uppercase tracking-wide text-muted-foreground">{market.title}</div>
            <div className={`grid ${COLS[market.cols]} gap-2`}>
              {market.cells.map((cell) => (
                <div key={cell.label} className={`${neu.raisedSm} px-2 py-2 text-center`}>
                  <div className="font-data text-[10px] text-muted-foreground">{cell.label}</div>
                  <div className="font-data text-base font-semibold">{odd(cell.price)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
