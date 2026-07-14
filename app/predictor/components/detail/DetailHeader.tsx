import { apiBase } from "../../apiBase";
import type { MatchDetail } from "../../detail";

type DetailTeam = { api_team_id: number; name: string };
type DetailMatch = {
  home_team: DetailTeam; away_team: DetailTeam;
  home_goals: number | null; away_goals: number | null;
};

export function DetailHeader({ detail }: { detail: MatchDetail }) {
  const m = detail.match as DetailMatch;
  const crest = (id: number) => `${apiBase()}/teams/${id}/image`;
  const Side = ({ team }: { team: DetailTeam }) => (
    <div className="flex flex-1 flex-col items-center gap-1 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={crest(team.api_team_id)} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
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
