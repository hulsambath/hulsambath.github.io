import * as React from "react";

import { crestUrl } from "../../apiBase";
import type { MatchDetail } from "../../detail";

type DetailTeam = { api_team_id: number; name: string; logo_url?: string | null };
type DetailMatch = {
  home_team: DetailTeam; away_team: DetailTeam;
  home_goals: number | null; away_goals: number | null;
};

function initialsFor(name: string) {
  return name.replace(/[^A-Za-z0-9 ]/g, "").split(" ")
    .filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
}

function TeamCrest({ team }: { team: DetailTeam }) {
  const [broken, setBroken] = React.useState(false);
  if (broken) {
    return (
      <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold text-muted-foreground">
        {initialsFor(team.name)}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={crestUrl(team.api_team_id, team.logo_url)}
      alt=""
      width={40}
      height={40}
      className="h-10 w-10 object-contain"
      onError={() => setBroken(true)}
    />
  );
}

export function DetailHeader({ detail }: { detail: MatchDetail }) {
  const m = detail.match as DetailMatch;
  const Side = ({ team }: { team: DetailTeam }) => (
    <div className="flex flex-1 flex-col items-center gap-1 text-center">
      <TeamCrest team={team} />
      <span className="text-sm font-semibold leading-tight">{team.name}</span>
    </div>
  );
  return (
    <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
      <Side team={m.home_team} />
      <div className="font-data text-2xl font-bold tabular-nums">
        {m.home_goals ?? 0}–{m.away_goals ?? 0}
      </div>
      <Side team={m.away_team} />
    </div>
  );
}
