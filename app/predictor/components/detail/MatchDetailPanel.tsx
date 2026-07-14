"use client";

import { X } from "lucide-react";
import * as React from "react";
import { apiBase } from "../../apiBase";
import type { MatchDetail } from "../../detail";
import { DetailHeader } from "./DetailHeader";
import { HeadToHead } from "./HeadToHead";
import { Lineups } from "./Lineups";
import { MatchStatsBars } from "./MatchStatsBars";
import { TeamForm } from "./TeamForm";
import { Timeline } from "./Timeline";

type PanelMatch = { home_team: { name: string }; away_team: { name: string } };

export function MatchDetailPanel({ matchId, onClose }: { matchId: number; onClose: () => void }) {
  const [detail, setDetail] = React.useState<MatchDetail | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let live = true;
    setDetail(null);
    setError(false);
    fetch(`${apiBase()}/matches/${matchId}/detail`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (live) setDetail(d); })
      .catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [matchId]);

  const m = detail?.match as PanelMatch | undefined;
  return (
    <div className="flex h-full flex-col">
      <button onClick={onClose} aria-label="Close details"
        className="mb-2 ml-auto rounded-full p-1 text-muted-foreground hover:text-foreground lg:hidden">
        <X className="h-5 w-5" />
      </button>
      {error && <p className="py-8 text-center text-sm text-muted-foreground">Details unavailable right now.</p>}
      {!error && !detail && <p className="py-8 text-center text-sm text-muted-foreground">Loading details…</p>}
      {detail && (
        <div className="overflow-y-auto">
          <DetailHeader detail={detail} />
          <Timeline incidents={detail.incidents} />
          <MatchStatsBars stats={detail.stats} />
          <Lineups lineups={detail.lineups} />
          <HeadToHead h2h={detail.h2h} />
          <TeamForm home={detail.home_form} away={detail.away_form}
            homeName={m?.home_team?.name ?? ""} awayName={m?.away_team?.name ?? ""} />
        </div>
      )}
    </div>
  );
}
