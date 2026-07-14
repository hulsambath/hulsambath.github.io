"use client";

import { ChevronDown, Star, Trophy } from "lucide-react";
import * as React from "react";
import { leagueLogoUrl } from "../apiBase";
import type { BoardLeague, BoardMatch, CompetitionGroup, StatusFilter } from "../board";
import { CountryFlag } from "./CountryFlag";

function badge(counts: CompetitionGroup<BoardMatch>["counts"], status: StatusFilter): string {
  if (status === "live" && counts.live > 0 && counts.total > counts.live)
    return `${counts.live}/${counts.total}`;
  return String(counts[status]);
}

function LeagueMark({ league }: { league: BoardLeague }) {
  const [broken, setBroken] = React.useState(false);
  const src = leagueLogoUrl(league.api_league_id);
  React.useEffect(() => setBroken(false), [src]);

  if (src && !broken) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        width={22}
        height={22}
        className="h-6 w-6 shrink-0 rounded-full bg-secondary object-contain p-0.5"
        onError={() => setBroken(true)}
      />
    );
  }

  const flag = <CountryFlag country={league.country} name={league.name} />;
  if (league.country) return flag;
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
      <Trophy className="h-3.5 w-3.5" />
    </span>
  );
}

export function CompetitionRow<T extends BoardMatch>({
  group, status, isFavourite, onToggleFavourite, renderMatch, defaultOpen = false,
}: {
  group: CompetitionGroup<T>;
  status: StatusFilter;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  renderMatch: (m: T) => React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  React.useEffect(() => setOpen(defaultOpen), [defaultOpen, group.league.id]);
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
          <LeagueMark league={group.league} />
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
        <div className="space-y-2 border-t border-border bg-background/40 p-2.5 md:space-y-0 md:p-0">
          {group.matches.map((m) => renderMatch(m))}
        </div>
      )}
    </div>
  );
}
