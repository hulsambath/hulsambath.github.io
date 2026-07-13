"use client";

import type { StatusFilter } from "../board";

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "live", label: "Live" },
  { key: "finished", label: "Finished" },
  { key: "upcoming", label: "Upcoming" },
];

export function FilterBar({
  status, onStatus, liveCount, oddsShown, onOddsToggle,
}: {
  status: StatusFilter;
  onStatus: (s: StatusFilter) => void;
  liveCount: number;
  oddsShown: boolean;
  onOddsToggle: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = status === t.key;
          const isLive = t.key === "live";
          return (
            <button key={t.key} onClick={() => onStatus(t.key)} aria-pressed={active}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-sm font-semibold uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${
                active
                  ? isLive
                    ? "border-[hsl(var(--live))] bg-[hsl(var(--live)/0.14)] text-[hsl(var(--live))]"
                    : "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"}`}>
              {isLive && <span className="live-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "hsl(var(--live))" }} />}
              {t.label}{isLive && liveCount > 0 ? ` (${liveCount})` : ""}
            </button>
          );
        })}
      </div>
      <button onClick={onOddsToggle} aria-pressed={oddsShown}
        className="flex shrink-0 items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Odds
        <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${oddsShown ? "bg-foreground" : "bg-muted"}`}>
          <span className={`inline-block h-4 w-4 rounded-full bg-background transition-transform ${oddsShown ? "translate-x-4" : "translate-x-0.5"}`} />
        </span>
      </button>
    </div>
  );
}
