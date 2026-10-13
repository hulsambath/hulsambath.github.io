import { ChevronUp, X } from "lucide-react";
import * as React from "react";
import { potentialReturn, totalOdds, type SlipPick } from "../../slip";

const money = (v: number) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Accumulator footer: collapsed it shows the pick count and combined odds;
 *  expanded it lists the picks with a stake calculator. */
export function BetSlip({ picks, onRemove, onClear }: {
  picks: SlipPick[];
  onRemove: (matchId: number) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [stake, setStake] = React.useState("10");
  if (picks.length === 0) return null;

  const odds = totalOdds(picks);
  const payout = potentialReturn(picks, Number.parseFloat(stake));

  return (
    <div className="bet-slip">
      <button type="button" className="bet-slip-bar" aria-expanded={open} aria-controls="bet-slip-body"
        onClick={() => setOpen((v) => !v)}>
        <span className="flex items-center gap-2">
          <span className="bet-slip-count">{picks.length}</span>
          {picks.length === 1 ? "Single" : "Accumulator"}
        </span>
        <span className="flex items-center gap-2">
          <span className="font-data text-base font-semibold">{odds?.toFixed(2)}</span>
          <ChevronUp className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </span>
      </button>
      {open && (
        <div id="bet-slip-body" className="bet-slip-body">
          <ul className="max-h-48 space-y-1.5 overflow-y-auto">
            {picks.map((p) => (
              <li key={p.matchId} className="flex items-start gap-2 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{p.label}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.marketTitle}, {p.matchLabel}</div>
                </div>
                <span className="font-data font-semibold">{p.price.toFixed(2)}</span>
                <button type="button" onClick={() => onRemove(p.matchId)} aria-label={`Remove ${p.label}, ${p.matchLabel}`}
                  className="neu-focus rounded p-0.5 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-end gap-3">
            <label className="flex-1 text-xs text-muted-foreground">
              Stake
              <input type="number" inputMode="decimal" min="0" step="1" value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="neu-inset-sm neu-focus mt-1 block w-full px-2 py-1.5 font-data text-sm text-foreground" />
            </label>
            <div className="flex-1 text-right text-xs text-muted-foreground">
              Potential return
              <div className="font-data text-lg font-semibold text-foreground">{payout == null ? "-" : money(payout)}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground">For comparing prices only. No bets are placed.</p>
            <button type="button" onClick={onClear} className="neu-focus shrink-0 text-xs font-semibold underline">Clear slip</button>
          </div>
        </div>
      )}
    </div>
  );
}
