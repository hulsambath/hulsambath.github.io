"use client";

import { Activity, ChevronDown, ChevronLeft, ChevronRight, Clock3, CornerDownRight, RefreshCw, ShieldCheck, WifiOff } from "lucide-react";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  dataBadges,
  groupByCompetition,
  isFinished,
  isLive,
  latestRefreshLabel,
  marketImplied,
  modelEdge,
  outcomeProbs,
  visibleCompetitions,
  type BoardLeague,
  type QuickFilter,
  type StatusFilter,
} from "./board";
import { fetchDateBuckets, fetchLeagues, fetchMatchesByDate } from "./client";
import { BoardHeader, type BoardTab } from "./components/BoardHeader";
import { CompetitionRow } from "./components/CompetitionRow";
import { CompetitionsTab } from "./components/CompetitionsTab";
import { FilterBar } from "./components/FilterBar";
import { crestUrl } from "./apiBase";
import { MatchDetailPanel } from "./components/detail/MatchDetailPanel";
import type { DateBucket, League, Match, Odds, Prediction, ScoreProb, Team, CornersLine } from "./types";
import { useFavourites } from "./useFavourites";
import { usePredictorSocket } from "./usePredictorSocket";


/* -------------------------------------------------------------- helpers */

/* Status helpers (isFinished, isLive) imported from ./board */

const pct = (p: number | null | undefined) =>
  p == null ? "–" : `${Math.round(p * 100)}%`;
const odd = (v: number | null | undefined) => (v == null ? "–" : v.toFixed(2));

/** yyyy-mm-dd in the viewer's local time. */
function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

const TOP_LEAGUE_NAMES = new Set([
  "Premier League", "LaLiga", "La Liga", "Bundesliga", "Serie A", "Ligue 1",
  "UEFA Champions League", "UEFA Europa League", "FIFA World Cup",
]);

/* ------------------------------------------------------- date strip data */

/** A continuous window of days around today; count carries whether each day
 *  has fixtures (0 → dimmed). */
function buildDayWindow(buckets: DateBucket[], back = 2, ahead = 10): DateBucket[] {
  const counts = new Map(buckets.map((b) => [b.date, b.count]));
  const days: DateBucket[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = -back; i <= ahead; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = isoDay(d);
    days.push({ date: iso, count: counts.get(iso) ?? 0 });
  }
  // include any bucket dates outside the window (e.g. midweek European ties)
  for (const b of buckets)
    if (!days.some((d) => d.date === b.date)) days.push(b);
  days.sort((a, b) => a.date.localeCompare(b.date));
  return days;
}

function relativeLabel(iso: string): { top: string; sub: string } {
  const today = isoDay(new Date());
  const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
  const yst = new Date(); yst.setDate(yst.getDate() - 1);
  const d = new Date(`${iso}T00:00:00`);
  const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
  const dayNum = d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  if (iso === today) return { top: "Today", sub: dayNum };
  if (iso === isoDay(tmr)) return { top: "Tmrw", sub: dayNum };
  if (iso === isoDay(yst)) return { top: "Yest", sub: dayNum };
  return { top: weekday, sub: dayNum };
}

/* ----------------------------------------------------------- components */

function TeamBadge({ team }: { team: Team }) {
  const [broken, setBroken] = React.useState(false);
  const initials = team.name.replace(/[^A-Za-z0-9 ]/g, "").split(" ")
    .filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  const src = crestUrl(team.api_team_id, team.logo_url);
  React.useEffect(() => setBroken(false), [src]);
  if (!broken)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={28} height={28}
      className="h-7 w-7 shrink-0 rounded-full bg-secondary object-contain p-0.5"
      onError={() => setBroken(true)} />;
  return (
    <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-[11px] font-bold text-muted-foreground">
      {initials || "?"}
    </span>
  );
}

function BadgeRow({ match }: { match: Match }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {dataBadges(match).map((badge) => (
        <span key={badge}
          className={`rounded-full border px-2 py-0.5 font-data text-[10px] uppercase tracking-wide ${
            badge === "Live"
              ? "border-[hsl(var(--live)/0.4)] bg-[hsl(var(--live)/0.12)] text-[hsl(var(--live))]"
              : badge === "Pending"
                ? "border-border bg-muted/40 text-muted-foreground"
                : "border-border bg-secondary/50 text-muted-foreground"
          }`}>
          {badge}
        </span>
      ))}
    </div>
  );
}

function MarketCell({ label, value, accent }: { label: string; value: number | null | undefined; accent?: boolean }) {
  return (
    <div className={`odds-cell flex min-h-11 flex-col items-center justify-center rounded-md border px-2 py-1 ${
      accent
        ? "border-[hsl(var(--home)/0.7)] bg-[hsl(var(--home)/0.08)]"
        : "border-border bg-secondary/40"
    }`}>
      <span className="font-data text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="font-data text-sm font-semibold">{odd(value)}</span>
    </div>
  );
}

function MarketCells({ odds, fav, compact = false }: { odds?: Odds | null | undefined; fav: "1" | "X" | "2" | null; compact?: boolean }) {
  const cells = [
    ["1", odds?.home_win ?? null],
    ["X", odds?.draw ?? null],
    ["2", odds?.away_win ?? null],
    ["O2.5", odds?.over_25 ?? null],
    ["U2.5", odds?.under_25 ?? null],
  ] as const;
  return (
    <div className={`grid gap-1.5 ${compact ? "grid-cols-5" : "grid-cols-5"}`}>
      {cells.map(([label, value]) => (
        <MarketCell key={label} label={label} value={value} accent={fav === label} />
      ))}
    </div>
  );
}

function favouriteOutcome(probs: { p1: number; px: number; p2: number } | null): "1" | "X" | "2" | null {
  if (!probs) return null;
  const entries: Array<["1" | "X" | "2", number]> = [
    ["1", probs.p1],
    ["X", probs.px],
    ["2", probs.p2],
  ];
  return entries.reduce((best, current) => (current[1] > best[1] ? current : best))[0];
}

function TriBand({ p1, px, p2, from }: { p1: number; px: number; p2: number; from: "model" | "market" }) {
  const seg = [
    { key: "1", value: p1, color: "hsl(var(--home))" },
    { key: "X", value: px, color: "hsl(var(--draw))" },
    { key: "2", value: p2, color: "hsl(var(--away))" },
  ];
  return (
    <div className="mt-2.5">
      <div className="mb-1 flex items-center justify-between font-data text-[11px] text-muted-foreground">
        <span className="uppercase tracking-wide">{from === "model" ? "model" : "market implied"}</span>
        <span className="flex gap-3">
          {seg.map((s) => (
            <span key={s.key}>
              <span className="mr-1 inline-block h-2 w-2 rounded-[2px]" style={{ background: s.color }} />
              {s.key} {pct(s.value)}
            </span>
          ))}
        </span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted" role="img"
        aria-label={`${from} probabilities — home ${pct(p1)}, draw ${pct(px)}, away ${pct(p2)}`}>
        {seg.map((s) => (
          <div key={s.key} className="band-segment h-full"
            style={{ width: `${s.value * 100}%`, background: s.color }} />
        ))}
      </div>
    </div>
  );
}

function ModelEdgeStrip({ match }: { match: Match }) {
  const edge = modelEdge(match.prediction, match.odds);
  const market = marketImplied(match.odds);
  if (!edge) {
    return (
      <div className="rounded-md border border-dashed border-border px-2.5 py-2 text-xs text-muted-foreground">
        Prediction pending
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-border bg-secondary/30 p-1.5">
      <div className="px-1.5 py-1">
        <div className="font-data text-[10px] uppercase tracking-wide text-muted-foreground">Model pick</div>
        <div className="font-display text-lg font-bold leading-none">{edge.pick} <span className="font-data text-sm">{pct(edge.probability)}</span></div>
      </div>
      <div className="px-1.5 py-1">
        <div className="font-data text-[10px] uppercase tracking-wide text-muted-foreground">Odds implied</div>
        <div className="font-data text-sm font-semibold">{edge.market == null ? "–" : pct(edge.market)}</div>
      </div>
      <div className="px-1.5 py-1">
        <div className="font-data text-[10px] uppercase tracking-wide text-muted-foreground">Edge</div>
        <div className={`font-data text-sm font-semibold ${edge.edge != null && edge.edge > 0 ? "text-[hsl(var(--edge))]" : ""}`}>
          {edge.edge == null ? "No odds" : `${edge.edge > 0 ? "+" : ""}${Math.round(edge.edge * 100)} pts`}
        </div>
      </div>
      {market && (
        <div className="col-span-3">
          <TriBand {...market} />
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/50 px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-data text-sm">{value}</div>
    </div>
  );
}

function CornerSummary({ prediction, compact = false }: { prediction?: Prediction | null | undefined; compact?: boolean }) {
  if (!prediction?.corners_lines && prediction?.exp_corners == null) return null;
  const bestLine = prediction.corners_lines
    ? Object.entries(prediction.corners_lines).find(([line]) => line === "9.5") ?? Object.entries(prediction.corners_lines)[0]
    : null;
  return (
    <div className={`mt-1.5 rounded-md border border-border bg-secondary/25 px-2 py-1 font-data text-[10px] text-muted-foreground ${compact ? "inline-flex items-center gap-1.5" : ""}`}>
      <span className="inline-flex items-center gap-1 uppercase tracking-wide">
        <CornerDownRight className="h-3 w-3" />
        Corners
      </span>
      <span className="ml-1 text-foreground">{prediction.exp_corners?.toFixed(1) ?? "–"} exp</span>
      {bestLine && (
        <span className="ml-1">O{bestLine[0]} {pct(bestLine[1].over)}</span>
      )}
    </div>
  );
}

/** Kickoff time, a pulsing LIVE badge, or the final score, depending on status. */
function StatusPill({ match }: { match: Match }) {
  if (isLive(match.status))
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--live)/0.14)] px-2 py-0.5 font-data text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--live))]">
        <span className="live-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: "hsl(var(--live))" }} />
        {match.status === "HT" ? "HT" : "Live"}
      </span>
    );
  if (isFinished(match.status))
    return <span className="font-data text-[11px] uppercase tracking-wide text-muted-foreground">FT</span>;
  return <span className="font-data text-xs text-muted-foreground">{timeLabel(match.kickoff_utc)}</span>;
}

function ScoreOrKickoff({ match }: { match: Match }) {
  const showScore = isLive(match.status) || isFinished(match.status);
  if (showScore) {
    return (
      <span className={`font-data text-lg font-bold tabular-nums ${isLive(match.status) ? "text-[hsl(var(--live))]" : ""}`}>
        {match.home_goals ?? 0}–{match.away_goals ?? 0}
      </span>
    );
  }
  return <span className="font-data text-sm text-muted-foreground">{timeLabel(match.kickoff_utc)}</span>;
}

function MatchCardMobile({ match, league, oddsShown = true, onSelect }: {
  match: Match;
  league?: League | undefined;
  oddsShown?: boolean;
  onSelect: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const p = match.prediction;
  const probs = outcomeProbs(match.prediction, match.odds);
  const showScore = isLive(match.status) || isFinished(match.status);
  const fav = favouriteOutcome(probs);

  return (
    <div className={`rounded-xl border bg-card transition-colors md:hidden ${isLive(match.status) ? "border-[hsl(var(--live)/0.5)]" : "border-border"}`}>
      <button
        className="w-full px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="mb-2.5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <StatusPill match={match} />
            {league && (
              <span className="truncate rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide">
                {league.name}
              </span>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <BadgeRow match={match} />
          <ScoreOrKickoff match={match} />
        </div>
        <div className="mb-1 space-y-1.5">
          {([["home", match.home_team, p?.home_exp_goals, match.home_goals],
             ["away", match.away_team, p?.away_exp_goals, match.away_goals]] as const).map(([side, team, xg, goals]) => (
            <div key={side} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2.5">
              <TeamBadge team={team} />
              <span className="truncate font-display text-lg font-semibold leading-tight">{team.name}</span>
              {showScore
                ? <span className={`font-data text-lg font-bold tabular-nums ${isLive(match.status) ? "text-[hsl(var(--live))]" : ""}`}>{goals ?? 0}</span>
                : <span className="font-data text-xs text-muted-foreground">{xg != null ? `${xg.toFixed(2)} xG` : ""}</span>}
            </div>
          ))}
        </div>
        <ModelEdgeStrip match={match} />
        <CornerSummary prediction={p ?? undefined} compact />
        {oddsShown && <div className="mt-2"><MarketCells odds={match.odds} fav={fav} compact /></div>}
        {probs ? <TriBand {...probs} /> : (
          <p className="mt-2 text-xs text-muted-foreground">No prices or prediction yet for this match.</p>
        )}
      </button>

      {open && p && (
        <div className="border-t border-border px-4 py-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Most likely scores</h4>
              <div className="flex flex-wrap gap-1.5">
                {(p.top_scores ?? []).map((s) => (
                  <span key={s.score} className="rounded-md border border-border px-2 py-1 font-data text-xs">
                    {s.score} <span className="text-muted-foreground">{pct(s.p)}</span>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Goals markets</h4>
              <div className="flex flex-wrap gap-1.5">
                <StatChip label="Over 1.5" value={pct(p.p_over_15)} />
                <StatChip label="Over 2.5" value={pct(p.p_over_25)} />
                <StatChip label="Over 3.5" value={pct(p.p_over_35)} />
                <StatChip label="BTTS" value={pct(p.p_btts)} />
              </div>
            </div>
          </div>
          {p.corners_lines && (
            <div className="mt-4">
              <h4 className="mb-1.5 flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <CornerDownRight className="h-3 w-3" />
                Corners · expected {p.exp_corners?.toFixed(1) ?? "–"}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(p.corners_lines).map(([line, v]) => (
                  <StatChip key={line} label={`Over ${line}`} value={pct(v.over)} />
                ))}
              </div>
            </div>
          )}
          <p className="mt-3 font-data text-[10px] text-muted-foreground">{p.model_version}</p>
        </div>
      )}
      {open && !p && (
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Model prediction pending — this league doesn&apos;t have enough result history yet.
        </div>
      )}
      <button onClick={onSelect}
        className="w-full border-t border-border px-4 py-2 text-left font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
        Open match details
      </button>
    </div>
  );
}

function MatchRowDesktop({ match, league, oddsShown, selected, onSelect }: {
  match: Match;
  league?: League | undefined;
  oddsShown: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const p = match.prediction;
  const probs = outcomeProbs(match.prediction, match.odds);
  const edge = modelEdge(match.prediction, match.odds);
  const fav = favouriteOutcome(probs);
  const showScore = isLive(match.status) || isFinished(match.status);
  return (
    <button onClick={onSelect}
      className={`match-row hidden w-full grid-cols-[5.25rem_minmax(0,1fr)_4.5rem_3.5rem_minmax(0,1fr)_9rem_18rem_5rem] items-center gap-3 border-b border-border/70 px-3 py-2 text-left transition-colors hover:bg-secondary/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring md:grid ${
        selected ? "bg-secondary/50 ring-1 ring-ring" : ""
      }`}>
      <div className="space-y-1">
        <StatusPill match={match} />
        <div className="font-data text-[10px] text-muted-foreground">{league?.country ?? "Competition"}</div>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <TeamBadge team={match.home_team} />
        <span className="truncate font-display text-base font-semibold">{match.home_team.name}</span>
      </div>
      <div className="text-center">
        {showScore ? (
          <span className={`font-data text-lg font-bold tabular-nums ${isLive(match.status) ? "text-[hsl(var(--live))]" : ""}`}>
            {match.home_goals ?? 0}–{match.away_goals ?? 0}
          </span>
        ) : (
          <div>
            <div className="font-data text-sm">{timeLabel(match.kickoff_utc)}</div>
            <div className="font-data text-[10px] text-muted-foreground">
              {p?.home_exp_goals != null && p.away_exp_goals != null ? `${p.home_exp_goals.toFixed(1)}-${p.away_exp_goals.toFixed(1)} xG` : "kickoff"}
            </div>
          </div>
        )}
      </div>
      <div className="text-center font-data tabular-nums text-sm text-muted-foreground">
        {match.home_corners != null && match.away_corners != null ? (
          <span className="font-semibold text-foreground">
            {match.home_corners}–{match.away_corners}
          </span>
        ) : p?.exp_corners != null ? (
          <span>{p.exp_corners.toFixed(1)} <span className="text-[10px] text-muted-foreground/60">exp</span></span>
        ) : (
          <span>–</span>
        )}
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2">
        <span className="truncate text-right font-display text-base font-semibold">{match.away_team.name}</span>
        <TeamBadge team={match.away_team} />
      </div>
      <div>
        {edge ? (
          <div className="rounded-md border border-border bg-secondary/35 px-2 py-1">
            <div className="font-data text-[10px] uppercase tracking-wide text-muted-foreground">Model pick</div>
            <div className="font-data text-sm font-semibold">{edge.pick} {pct(edge.probability)}</div>
            <div className={`font-data text-[10px] ${edge.edge != null && edge.edge > 0 ? "text-[hsl(var(--edge))]" : "text-muted-foreground"}`}>
              {edge.edge == null ? "No market" : `${edge.edge > 0 ? "+" : ""}${Math.round(edge.edge * 100)} pts`}
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Prediction pending</span>
        )}
      </div>
      <div>
        {oddsShown ? <MarketCells odds={match.odds} fav={fav} /> : (
          <div className="font-data text-xs text-muted-foreground">Odds hidden</div>
        )}
      </div>
      <BadgeRow match={match} />
    </button>
  );
}

/** Horizontal, scroll-snapping day selector. Empty days render dimmed. */
function DateStrip({ days, selected, onSelect }: {
  days: DateBucket[]; selected: string; onSelect: (d: string) => void;
}) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const nudge = (dir: number) => scroller.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  return (
    <div className="relative flex items-center gap-1">
      <button aria-label="Earlier days" onClick={() => nudge(-1)}
        className="hidden shrink-0 rounded-full border border-border p-1 text-muted-foreground hover:text-foreground sm:block">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div ref={scroller} className="date-strip flex flex-1 gap-1.5 overflow-x-auto scroll-smooth py-1">
        {days.map((d) => {
          const { top, sub } = relativeLabel(d.date);
          const active = d.date === selected;
          const empty = d.count === 0;
          return (
            <button key={d.date} onClick={() => onSelect(d.date)} aria-pressed={active}
              className={`flex shrink-0 snap-start flex-col items-center rounded-lg border px-3.5 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${
                active ? "border-foreground bg-foreground text-background"
                       : empty ? "border-border/60 text-muted-foreground/50"
                               : "border-border text-foreground hover:border-foreground/60"}`}>
              <span className="font-display text-sm font-semibold uppercase leading-none">{top}</span>
              <span className="mt-0.5 font-data text-[10px] leading-none opacity-70">{sub}</span>
            </button>
          );
        })}
      </div>
      <button aria-label="Later days" onClick={() => nudge(1)}
        className="hidden shrink-0 rounded-full border border-border p-1 text-muted-foreground hover:text-foreground sm:block">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------- page */

export default function PredictorPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const [leagues, setLeagues] = React.useState<League[]>([]);
  const [buckets, setBuckets] = React.useState<DateBucket[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string>(() => isoDay(new Date()));
  const [tab, setTab] = React.useState<BoardTab>("all");
  const [status, setStatus] = React.useState<StatusFilter>("live");
  const [oddsShown, setOddsShown] = React.useState(true);
  const [quickFilters, setQuickFilters] = React.useState<Set<QuickFilter>>(() => new Set());
  const [leagueId, setLeagueId] = React.useState<number | null>(null);
  const [selectedMatchId, setSelectedMatchId] = React.useState<number | null>(null);
  const [matches, setMatches] = React.useState<Match[] | null>(null);
  const { favourites, isFavourite, toggle } = useFavourites();
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const today = isoDay(new Date());

  const loadDay = React.useCallback((date: string) => {
    fetchMatchesByDate(date)
      .then((data) => {
        setMatches(data);
        setLastUpdated(new Date());
      })
      .catch(() => setError("The prediction server is not reachable right now."));
  }, []);

  // initial: leagues + available dates; default to today or nearest fixtures
  React.useEffect(() => {
    fetchLeagues().then(setLeagues).catch(() => {});
    fetchDateBuckets().then((bs: DateBucket[]) => {
      setBuckets(bs);
      if (!bs.some((b) => b.date === today) && bs.length) {
        const next = bs.find((b) => b.date >= today) ?? bs[bs.length - 1];
        if (next) setSelectedDate(next.date);
      }
    }).catch(() => setError("The prediction server is not reachable right now."));
  }, [today]);

  React.useEffect(() => { loadDay(selectedDate); }, [selectedDate, loadDay]);

  // lock body scroll while the mobile detail drawer is open
  React.useEffect(() => {
    if (selectedMatchId == null) return;
    const mql = window.matchMedia("(max-width: 1023px)");
    if (!mql.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [selectedMatchId]);

  const days = buildDayWindow(buckets);
  const leagueById = new Map(leagues.map((l) => [l.id, l]));
  const boardLeaguesById = new Map<number, BoardLeague>(
    leagues.map((l) => [l.id, { id: l.id, api_league_id: l.api_league_id, name: l.name, country: l.country }]));
  const topLeagueIds = new Set(leagues.filter((l) => TOP_LEAGUE_NAMES.has(l.name)).map((l) => l.id));
  const groups = groupByCompetition(matches ?? [], boardLeaguesById);
  const liveCount = (matches ?? []).filter((m) => isLive(m.status)).length;
  const predictionCount = (matches ?? []).filter((m) => m.prediction).length;
  const oddsCount = (matches ?? []).filter((m) => m.odds).length;
  const competitions = visibleCompetitions(groups, {
    status, favourites, onlyFavourites: tab === "favourites", leagueId,
    quickFilters, topLeagueIds,
  });
  const visibleMatchIds = React.useMemo(
    () => competitions.flatMap((group) => group.matches.map((match) => match.id)),
    [competitions],
  );
  const wsStatus = usePredictorSocket({
    selectedDate,
    today,
    visibleMatchIds,
    selectedMatchId,
    matches,
    onPatch: setMatches,
    onRefreshDay: () => loadDay(selectedDate),
  });
  const toggleQuickFilter = React.useCallback((filter: QuickFilter) => {
    setQuickFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  }, []);

  if (!mounted) {
    return (
      <main className="predictor-page mx-auto min-h-screen max-w-3xl px-4 py-8 sm:py-12 lg:max-w-6xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground/60" />
          <p className="font-data text-xs text-muted-foreground/60">Loading matchday board…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="predictor-page mx-auto min-h-screen max-w-3xl px-4 py-8 sm:py-12 lg:max-w-6xl">
      <header className="mb-5">
        <p className="font-data text-xs text-muted-foreground">hulsambath.me / predictor</p>
        <h1 className="font-display text-4xl font-bold uppercase leading-none sm:text-5xl">
          Matchday board
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Live fixtures and bookmaker prices from Sofascore, goal and corners
          probabilities from a time-weighted Poisson model. Not betting advice.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-data text-xs text-muted-foreground">
          {wsStatus === "live" ? (
            <><span className="live-dot inline-block h-2 w-2 rounded-full" style={{ background: "hsl(var(--live))" }} />
              live — updates automatically</>
          ) : wsStatus === "connecting" ? (
            <><RefreshCw className="h-3 w-3 animate-spin" /> connecting…</>
          ) : (
            <><WifiOff className="h-3 w-3" /> live feed unavailable — showing last fetch</>
          )}
          <span className="flex items-center gap-1.5"><Clock3 className="h-3 w-3" />{latestRefreshLabel(lastUpdated)}</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" />{predictionCount} predicted</span>
          <span className="flex items-center gap-1.5"><Activity className="h-3 w-3" />{oddsCount} with odds</span>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {error} Check that the API is running and CORS allows this origin.
        </div>
      )}

      <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-border bg-background/85 px-4 pb-2 pt-3 backdrop-blur">
        <BoardHeader tab={tab} onTab={(t) => { setTab(t); setLeagueId(null); }} favouriteCount={favourites.size}>
          <DateStrip days={days} selected={selectedDate} onSelect={setSelectedDate} />
        </BoardHeader>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-6">
        <div>
          {tab === "competitions" ? (
            <CompetitionsTab
              leagues={leagues.map((l) => ({ id: l.id, api_league_id: l.api_league_id, name: l.name, country: l.country }))}
              onPick={(id) => { setLeagueId(id); setTab("all"); }}
            />
          ) : (
            <>
              <FilterBar status={status} onStatus={setStatus} liveCount={liveCount}
                oddsShown={oddsShown} onOddsToggle={() => setOddsShown((v) => !v)}
                quickFilters={quickFilters} onQuickFilter={toggleQuickFilter} />
              {matches && matches.length > 0 && (predictionCount === 0 || oddsCount === 0) && (
                <div className="mb-4 grid gap-2 sm:grid-cols-2">
                  {predictionCount === 0 && (
                    <div className="rounded-xl border border-border bg-secondary/35 p-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Predictions pending.</span> The board is still usable for fixtures and live scores; model probabilities will appear after backend coverage is restored.
                    </div>
                  )}
                  {oddsCount === 0 && (
                    <div className="rounded-xl border border-border bg-secondary/35 p-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Market odds unavailable.</span> Real bookmaker prices are not visible for this day yet, so market columns show dashes.
                    </div>
                  )}
                </div>
              )}
              {oddsShown && competitions.length > 0 && (
                <div className="sticky top-[8.75rem] z-[5] mb-2 hidden grid-cols-[5.25rem_minmax(0,1fr)_4.5rem_3.5rem_minmax(0,1fr)_9rem_18rem_5rem] items-center gap-3 rounded-lg border border-border bg-background/90 px-3 py-2 font-data text-[10px] uppercase tracking-wide text-muted-foreground backdrop-blur md:grid">
                  <span>Status</span>
                  <span>Home</span>
                  <span className="text-center">Score</span>
                  <span className="text-center">Corners</span>
                  <span className="text-right">Away</span>
                  <span>Model</span>
                  <span className="grid grid-cols-5 gap-1.5 text-center"><span>1</span><span>X</span><span>2</span><span>O2.5</span><span>U2.5</span></span>
                  <span>Data</span>
                </div>
              )}
              <section aria-label="Competitions">
                {matches === null && !error && (
                  <p className="py-8 text-center text-sm text-muted-foreground">Loading fixtures…</p>
                )}
                {matches !== null && competitions.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    No {status} matches{tab === "favourites" ? " in your favourites" : ""} for this day. Try another day or filter.
                  </div>
                )}
                {competitions.map((g) => (
                  <CompetitionRow key={g.league.id} group={g} status={status}
                    isFavourite={isFavourite(g.league.id)}
                    defaultOpen={status === "live" || isFavourite(g.league.id) || competitions.length <= 4}
                    onToggleFavourite={() => toggle(g.league.id)}
                    renderMatch={(m) => (
                      <React.Fragment key={m.id}>
                        <MatchRowDesktop match={m}
                          {...(leagueById.get(m.league_id) ? { league: leagueById.get(m.league_id) } : {})}
                          oddsShown={oddsShown} selected={selectedMatchId === m.id}
                          onSelect={() => {
                            setSelectedMatchId(m.id);
                            router.replace(`/predictor/match?id=${m.id}`, { scroll: false });
                          }} />
                        <MatchCardMobile match={m}
                          {...(leagueById.get(m.league_id) ? { league: leagueById.get(m.league_id) } : {})}
                          oddsShown={oddsShown} onSelect={() => {
                            setSelectedMatchId(m.id);
                            router.replace(`/predictor/match?id=${m.id}`, { scroll: false });
                          }} />
                      </React.Fragment>
                    )} />
                ))}
              </section>
            </>
          )}
        </div>

        <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-hidden rounded-xl border border-border bg-card p-4 lg:block">
          {selectedMatchId
            ? <MatchDetailPanel matchId={selectedMatchId} onClose={() => {
              setSelectedMatchId(null);
              router.replace("/predictor", { scroll: false });
            }} />
            : <p className="py-12 text-center text-sm text-muted-foreground">Select a match to see details.</p>}
        </aside>
      </div>

      {selectedMatchId != null && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background p-4 lg:hidden">
          <MatchDetailPanel matchId={selectedMatchId} onClose={() => {
            setSelectedMatchId(null);
            router.replace("/predictor", { scroll: false });
          }} />
        </div>
      )}

      <footer className="mt-12 border-t border-border pt-4 text-xs text-muted-foreground">
        Built on a FastAPI + PostgreSQL Poisson model, fed by Sofascore.{" "}
        <a className="underline underline-offset-2 hover:text-foreground" href="https://hulsambath.me">
          ← back to hulsambath.me
        </a>
      </footer>
    </main>
  );
}
