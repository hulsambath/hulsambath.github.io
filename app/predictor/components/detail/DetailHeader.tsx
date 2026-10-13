
import { crestUrl } from "../../apiBase";
import { isFinished, isLive } from "../../board";
import type { MatchDetail } from "../../detail";
import { neu } from "../../neu";
import { Crest } from "../Crest";

type DetailTeam = { api_team_id: number; name: string; logo_url?: string | null };
type DetailMatch = {
  home_team: DetailTeam; away_team: DetailTeam;
  home_goals: number | null; away_goals: number | null;
  kickoff_utc: string;
  status: string;
};

export function DetailHeader({ detail }: { detail: MatchDetail }) {
  const m = detail.match as DetailMatch;
  const hasScore = isLive(m.status) || isFinished(m.status);
  const Side = ({ team }: { team: DetailTeam }) => (
    <div className="flex flex-1 flex-col items-center gap-1 text-center">
      <span className={`${neu.raised} rounded-full p-2`}><Crest src={crestUrl(team.api_team_id, team.logo_url)} name={team.name} size={40} /></span>
      <span className="mt-1 text-sm font-semibold leading-tight">{team.name}</span>
    </div>
  );
  return (
    <div className="mb-5 flex items-center justify-between gap-3 pt-1">
      <Side team={m.home_team} />
      <div className={`${neu.inset} min-w-20 px-4 py-2 text-center font-data tabular-nums`}>
        {hasScore ? (
          <div className="text-2xl font-bold">{m.home_goals ?? 0}–{m.away_goals ?? 0}</div>
        ) : (
          <>
            <div className="text-lg font-bold">
              {new Date(m.kickoff_utc).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {new Date(m.kickoff_utc).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
            </div>
          </>
        )}
      </div>
      <Side team={m.away_team} />
    </div>
  );
}
