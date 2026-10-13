import * as React from "react";
import { neuPressable } from "../../neu";
import { MARKET_GROUPS, type MarketGroup } from "../../odds";
import { fairOdds, modelMarkets } from "../../modelMarkets";
import type { ModelMarkets } from "../../types";
import { COLS } from "./OddsMarkets";

const pct = (p: number) => `${Math.round(p * 100)}%`;

/** Every market the model prices, as probability and fair (no-margin) odds. */
export function ModelMarketsPanel({ markets, names }: {
  markets: ModelMarkets | null | undefined;
  names: { home: string; away: string };
}) {
  const list = React.useMemo(() => modelMarkets(markets, names), [markets, names]);
  const [group, setGroup] = React.useState<MarketGroup | "all">("all");
  if (list.length === 0) return null;

  const groups = MARKET_GROUPS.filter((g) => list.some((m) => m.group === g.key));
  const active = groups.some((g) => g.key === group) ? group : "all";
  const shown = active === "all" ? list : list.filter((m) => m.group === active);

  return (
    <section className="mb-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">All markets · model</h3>
      <div className="date-strip -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Model market categories">
        {[{ key: "all" as const, label: "All" }, ...groups].map((g) => (
          <button key={g.key} type="button" role="tab" aria-selected={active === g.key}
            onClick={() => setGroup(g.key)} className={neuPressable(active === g.key, "shrink-0 px-2.5 py-1 text-xs")}>
            {g.label}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-1">
        {shown.map((market) => (
          <section key={market.key} className="odds-market">
            <h4 className="odds-head">{market.title}</h4>
            <div className={`grid ${COLS[market.cols]} gap-1.5 p-2`}>
              {market.cells.map((cell) => {
                const fair = fairOdds(cell.p);
                return (
                  <div key={cell.id} className="model-cell">
                    <span className="odds-btn-label">{cell.label}</span>
                    <span className="odds-btn-price">{pct(cell.p)}</span>
                    <span className="model-cell-fair">{fair == null ? "-" : fair.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
