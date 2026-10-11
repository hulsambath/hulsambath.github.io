"use client";

import { Activity, Clock3, ShieldCheck, SlidersHorizontal, TrendingUp } from "lucide-react";
import type { ComponentType } from "react";
import type { QuickFilter, StatusFilter } from "../board";
import { neu, neuPressable } from "../neu";

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "live", label: "Live" },
  { key: "finished", label: "Finished" },
  { key: "upcoming", label: "Upcoming" },
];

export function FilterBar({
  status, onStatus, liveCount, oddsShown, onOddsToggle, quickFilters, onQuickFilter,
}: {
  status: StatusFilter;
  onStatus: (s: StatusFilter) => void;
  liveCount: number;
  oddsShown: boolean;
  onOddsToggle: () => void;
  quickFilters: Set<QuickFilter>;
  onQuickFilter: (f: QuickFilter) => void;
}) {
  const quick: { key: QuickFilter; label: string; icon: ComponentType<{ className?: string }> }[] = [
    { key: "top", label: "Top", icon: TrendingUp },
    { key: "predictions", label: "Predicted", icon: ShieldCheck },
    { key: "odds", label: "Odds", icon: Activity },
    { key: "soon", label: "Soon", icon: Clock3 },
  ];
  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2.5">
          {TABS.map((t) => {
            const active = status === t.key;
            const isLive = t.key === "live";
            return (
              <button key={t.key} onClick={() => onStatus(t.key)} aria-pressed={active}
                className={neuPressable(active, `flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-display text-sm font-semibold uppercase tracking-wide${
                  active && isLive ? " !text-[hsl(var(--live))]" : ""}`)}>
                {isLive && <span className="live-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "hsl(var(--live))" }} />}
                {t.label}{isLive && liveCount > 0 ? ` (${liveCount})` : ""}
              </button>
            );
          })}
        </div>
        <button onClick={onOddsToggle} aria-pressed={oddsShown}
          className="neu-focus flex shrink-0 items-center gap-2 rounded-full font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Odds
          <span className={`${neu.insetSm} relative inline-flex h-6 w-11 items-center rounded-full`}>
            <span className={`${neu.raisedSm} inline-block h-4 w-4 rounded-full transition-transform ${
              oddsShown ? "translate-x-6 !bg-[hsl(var(--neu-accent))]" : "translate-x-1"}`} />
          </span>
        </button>
      </div>
      <div className="-mx-2 flex items-center gap-2 overflow-x-auto px-2 py-2">
        <span className="flex shrink-0 items-center gap-1 font-data text-[10px] uppercase tracking-wide text-muted-foreground">
          <SlidersHorizontal className="h-3 w-3" />
          Quick
        </span>
        {quick.map((item) => {
          const Icon = item.icon;
          const active = quickFilters.has(item.key);
          return (
            <button key={item.key} type="button" onClick={() => onQuickFilter(item.key)} aria-pressed={active}
              className={neuPressable(active, "flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 font-data text-[11px] uppercase tracking-wide")}>
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
