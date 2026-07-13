"use client";

import { ChevronDown, Star } from "lucide-react";
import * as React from "react";
import type { BoardMatch, CompetitionGroup, StatusFilter } from "../board";
import { CountryFlag } from "./CountryFlag";

function badge(counts: CompetitionGroup<BoardMatch>["counts"], status: StatusFilter): string {
  if (status === "live" && counts.live > 0 && counts.total > counts.live)
    return `${counts.live}/${counts.total}`;
  return String(counts[status]);
}

export function CompetitionRow<T extends BoardMatch>({
  group, status, isFavourite, onToggleFavourite, renderMatch,
}: {
  group: CompetitionGroup<T>;
  status: StatusFilter;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  renderMatch: (m: T) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mb-2 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button aria-label={isFavourite ? "Unfavourite" : "Favourite"}
          onClick={onToggleFavourite}
          className="shrink-0 text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
          <Star className={`h-4 w-4 ${isFavourite ? "fill-[hsl(var(--live))] text-[hsl(var(--live))]" : ""}`} />
        </button>
        <button onClick={() => setOpen(!open)} aria-expanded={open}
          className="flex flex-1 items-center gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
          <CountryFlag country={group.league.country} name={group.league.name} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-sm font-semibold uppercase tracking-wide">{group.league.name}</span>
            {group.league.country && (
              <span className="block truncate text-[11px] text-muted-foreground/70">{group.league.country}</span>
            )}
          </span>
          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 font-data text-xs font-semibold text-muted-foreground">
            {badge(group.counts, status)}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="space-y-2 border-t border-border bg-background/40 p-2.5">
          {group.matches.map((m) => renderMatch(m))}
        </div>
      )}
    </div>
  );
}
