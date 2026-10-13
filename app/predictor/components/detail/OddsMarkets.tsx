import { ChevronDown } from "lucide-react";
import * as React from "react";
import { neuPressable } from "../../neu";
import { MARKET_GROUPS, oddsMarkets, type MarketGroup, type OddsCell, type OddsMarket } from "../../odds";
import type { SlipPick } from "../../slip";
import type { Odds } from "../../types";

// Narrow side panel (xl+) keeps the base column count; the full-screen view
// below xl gets room for more prices per row.
const COLS = {
  1: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
} as const;

const odd = (v: number | null | undefined) => v == null ? "-" : v.toFixed(2);
const timestamp = (value: string | null | undefined) => value
  ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
  : null;

function PriceButton({ cell, selected, onPick }: {
  cell: OddsCell;
  selected: boolean;
  onPick: (cell: OddsCell) => void;
}) {
  return (
    <button type="button" className="odds-btn" aria-pressed={selected}
      disabled={cell.price == null} onClick={() => onPick(cell)}>
      <span className="odds-btn-label">{cell.label}</span>
      <span className="odds-btn-price">{odd(cell.price)}</span>
    </button>
  );
}

function MarketBlock({ market, open, selectedId, onToggle, onPick }: {
  market: OddsMarket;
  open: boolean;
  selectedId: string | undefined;
  onToggle: () => void;
  onPick: (market: OddsMarket, cell: OddsCell) => void;
}) {
  const bodyId = `odds-market-${market.key}`;
  return (
    <section className="odds-market">
      <h4>
        <button type="button" className="odds-head" aria-expanded={open} aria-controls={bodyId} onClick={onToggle}>
          <span>{market.title}</span>
          <ChevronDown className="odds-chevron h-4 w-4" aria-hidden />
        </button>
      </h4>
      {open && (
        <div id={bodyId} className={`grid ${COLS[market.cols]} gap-1.5 p-2`}>
          {market.cells.map((cell) => (
            <PriceButton key={cell.id} cell={cell} selected={cell.id === selectedId}
              onPick={(c) => onPick(market, c)} />
          ))}
        </div>
      )}
    </section>
  );
}

export function OddsMarkets({ odds, matchId, matchLabel, picks, onPick }: {
  odds: Partial<Odds> | null;
  matchId: number;
  matchLabel: string;
  picks: SlipPick[];
  onPick: (pick: SlipPick) => void;
}) {
  const markets = React.useMemo(() => (odds ? oddsMarkets(odds) : []), [odds]);
  const [group, setGroup] = React.useState<MarketGroup | "all">("all");
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());

  if (!odds || markets.length === 0) {
    return <p className="neu-inset p-3 text-sm text-muted-foreground">No bookmaker prices for this match yet.</p>;
  }

  const groups = MARKET_GROUPS
    .map((g) => ({ ...g, count: markets.filter((m) => m.group === g.key).length }))
    .filter((g) => g.count > 0);
  const active = groups.some((g) => g.key === group) ? group : "all";
  const shown = active === "all" ? markets : markets.filter((m) => m.group === active);
  const selectedId = picks.find((p) => p.matchId === matchId)?.cellId;

  const toggleMarket = (key: string) => setCollapsed((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });
  const pick = (market: OddsMarket, cell: OddsCell) => {
    if (cell.price == null) return;
    onPick({ matchId, matchLabel, cellId: cell.id, marketTitle: market.title, label: cell.label, price: cell.price });
  };

  return (
    <section className="mb-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-base font-semibold">Bookmaker odds</h3>
        <span className="text-xs text-muted-foreground">
          {odds.bookmaker ?? "Bookmaker"}{odds.is_closing ? ", closing line" : ""}
        </span>
      </div>
      {odds.captured_at && (
        <p className="mb-2 text-xs text-muted-foreground">Updated {timestamp(odds.captured_at)}</p>
      )}
      <div className="date-strip -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Market categories">
        {[{ key: "all" as const, label: "All", count: markets.length }, ...groups].map((g) => (
          <button key={g.key} type="button" role="tab" aria-selected={active === g.key}
            onClick={() => setGroup(g.key)}
            className={neuPressable(active === g.key, "shrink-0 px-2.5 py-1 text-xs")}>
            {g.label} <span className="font-data text-[10px] opacity-70">{g.count}</span>
          </button>
        ))}
      </div>
      <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-1">
        {shown.map((market) => (
          <MarketBlock key={market.key} market={market} open={!collapsed.has(market.key)}
            selectedId={selectedId} onToggle={() => toggleMarket(market.key)} onPick={pick} />
        ))}
      </div>
    </section>
  );
}
