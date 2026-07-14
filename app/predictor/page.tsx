"use client";

import { ChevronDown, ChevronLeft, ChevronRight, CornerDownRight, RefreshCw, WifiOff } from "lucide-react";
import * as React from "react";
import { groupByCompetition, visibleCompetitions, type BoardLeague, type StatusFilter } from "./board";
import { BoardHeader, type BoardTab } from "./components/BoardHeader";
import { CompetitionRow } from "./components/CompetitionRow";
import { CompetitionsTab } from "./components/CompetitionsTab";
import { FilterBar } from "./components/FilterBar";
import { apiBase, wsBase } from "./apiBase";
import { useFavourites } from "./useFavourites";

/* ---------------------------------------------------------------- types */

type League = { id: number; api_league_id: number; name: string; country: string | null };
type Team = { id: number; api_team_id: number; name: string; logo_url: string | null };
type ScoreProb = { score: string; p: number };
type CornersLine = { over: number; under: number };
type Prediction = {
  model_version: string;
  home_exp_goals: number | null;
  away_exp_goals: number | null;
  p_home: number | null;
  p_draw: number | null;
  p_away: number | null;
  p_over_15: number | null;
  p_over_25: number | null;
  p_over_35: number | null;
  p_btts: number | null;
  top_scores: ScoreProb[] | null;
  exp_corners: number | null;
  corners_lines: Record<string, CornersLine> | null;
};
type Odds = {
  bookmaker: string | null;
  home_win: number | null;
  draw: number | null;
  away_win: number | null;
  over_25: number | null;
  under_25: number | null;
};
type Match = {
  id: number;
  league_id: number;
  round: string | null;
  kickoff_utc: string;
  status: string;
  home_team: Team;
  away_team: Team;
  home_goals: number | null;
  away_goals: number | null;
  prediction?: Prediction | null;
  odds?: Odds | null;
};
type DateBucket = { date: string; count: number };


/* -------------------------------------------------------------- helpers */

const FINISHED = new Set(["FT", "AET", "PEN"]);
const NOT_LIVE = new Set(["NS", "PST", "CANC", "FT", "AET", "PEN"]);
const isFinished = (s: string) => FINISHED.has(s);
const isLive = (s: string) => !NOT_LIVE.has(s);

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

/** Model probabilities when available, else bookmaker-implied (normalized). */
function outcomeProbs(m: Match): { p1: number; px: number; p2: number; from: "model" | "market" } | null {
  const p = m.prediction;
  if (p?.p_home != null && p.p_draw != null && p.p_away != null)
    return { p1: p.p_home, px: p.p_draw, p2: p.p_away, from: "model" };
  const o = m.odds;
  if (o?.home_win && o.draw && o.away_win) {
    const inv = [1 / o.home_win, 1 / o.draw, 1 / o.away_win];
    const s = inv[0] + inv[1] + inv[2];
    return { p1: inv[0] / s, px: inv[1] / s, p2: inv[2] / s, from: "market" };
  }
  return null;
}

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
    .filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const src = `${apiBase()}/teams/${team.api_team_id}/image`;
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

/** The signature element: sportsbook price cells for 1 / X / 2 (and O/U 2.5),
 *  with the model's favored outcome subtly accented in its outcome color. */
function OddsBoard({ odds, fav }: { odds: Odds; fav: "1" | "X" | "2" | null }) {
  const color = { "1": "--home", X: "--draw", "2": "--away" } as const;
  const main = [["1", odds.home_win], ["X", odds.draw], ["2", odds.away_win]] as const;
  const goals = [["O2.5", odds.over_25], ["U2.5", odds.under_25]] as const;
  const Cell = ({ k, v, accent }: { k: string; v: number | null; accent?: string }) => (
    <div className="odds-cell flex flex-1 flex-col items-center rounded-md border border-border bg-secondary/40 px-2 py-1.5"
      style={accent ? { borderColor: `hsl(${accent})`, boxShadow: `inset 0 -2px 0 hsl(${accent} / 0.55)` } : undefined}>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</span>
      <span className="font-data text-sm font-medium">{odd(v)}</span>
    </div>
  );
  return (
    <div className="mt-3 flex items-stretch gap-1.5">
      {main.map(([k, v]) => (
        <Cell key={k} k={k} v={v} accent={fav === k ? `var(${color[k]})` : undefined} />
      ))}
      <span className="mx-0.5 w-px shrink-0 self-stretch bg-border" aria-hidden />
      {goals.map(([k, v]) => <Cell key={k} k={k} v={v} />)}
    </div>
  );
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

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/50 px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-data text-sm">{value}</div>
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

function MatchCard({ match, league, oddsShown = true }: { match: Match; league?: League; oddsShown?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const p = match.prediction;
  const probs = outcomeProbs(match);
  const showScore = isLive(match.status) || isFinished(match.status);
  const fav = probs
    ? (["1", "X", "2"] as const)[[probs.p1, probs.px, probs.p2].indexOf(Math.max(probs.p1, probs.px, probs.p2))]
    : null;

  return (
    <div className={`rounded-xl border bg-card transition-colors ${isLive(match.status) ? "border-[hsl(var(--live)/0.5)]" : "border-border"}`}>
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
        {oddsShown && match.odds && <OddsBoard odds={match.odds} fav={fav} />}
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
    </div>
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

type WsStatus = "live" | "connecting" | "offline";

export default function PredictorPage() {
  const [leagues, setLeagues] = React.useState<League[]>([]);
  const [buckets, setBuckets] = React.useState<DateBucket[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string>(() => isoDay(new Date()));
  const [tab, setTab] = React.useState<BoardTab>("all");
  const [status, setStatus] = React.useState<StatusFilter>("live");
  const [oddsShown, setOddsShown] = React.useState(false);
  const [leagueId, setLeagueId] = React.useState<number | null>(null);
  const [matches, setMatches] = React.useState<Match[] | null>(null);
  const { favourites, isFavourite, toggle } = useFavourites();
  const [wsStatus, setWsStatus] = React.useState<WsStatus>("connecting");
  const [error, setError] = React.useState<string | null>(null);

  const today = isoDay(new Date());

  const loadDay = React.useCallback((date: string) => {
    fetch(`${apiBase()}/matches/by-date?date=${date}`)
      .then((r) => r.json()).then(setMatches)
      .catch(() => setError("The prediction server is not reachable right now."));
  }, []);

  // initial: leagues + available dates; default to today or nearest fixtures
  React.useEffect(() => {
    fetch(`${apiBase()}/leagues`).then((r) => r.json()).then(setLeagues).catch(() => {});
    fetch(`${apiBase()}/matches/dates`).then((r) => r.json()).then((bs: DateBucket[]) => {
      setBuckets(bs);
      if (!bs.some((b) => b.date === today) && bs.length) {
        const next = bs.find((b) => b.date >= today) ?? bs[bs.length - 1];
        setSelectedDate(next.date);
      }
    }).catch(() => setError("The prediction server is not reachable right now."));
  }, [today]);

  React.useEffect(() => { loadDay(selectedDate); }, [selectedDate, loadDay]);

  // live socket: while viewing today, refresh the day's board when it changes
  React.useEffect(() => {
    let closed = false;
    const ws = new WebSocket(`${wsBase()}/ws/matches`);
    ws.onopen = () => setWsStatus("live");
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if ((msg.type === "update" || msg.type === "snapshot") && selectedDate === today)
        loadDay(today);
    };
    ws.onclose = () => { if (!closed) setWsStatus("offline"); };
    ws.onerror = () => { if (!closed) setWsStatus("offline"); };
    return () => { closed = true; ws.close(); };
  }, [selectedDate, today, loadDay]);

  const days = buildDayWindow(buckets);
  const leagueById = new Map(leagues.map((l) => [l.id, l]));
  const boardLeaguesById = new Map<number, BoardLeague>(
    leagues.map((l) => [l.id, { id: l.id, name: l.name, country: l.country }]));
  const groups = groupByCompetition(matches ?? [], boardLeaguesById);
  const liveCount = (matches ?? []).filter((m) => isLive(m.status)).length;
  const competitions = visibleCompetitions(groups, {
    status, favourites, onlyFavourites: tab === "favourites", leagueId,
  });

  return (
    <main className="predictor-page mx-auto min-h-screen max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-5">
        <p className="font-data text-xs text-muted-foreground">hulsambath.me / predictor</p>
        <h1 className="font-display text-4xl font-bold uppercase leading-none sm:text-5xl">
          Matchday board
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Live fixtures and bookmaker prices from Sofascore, goal and corners
          probabilities from a time-weighted Poisson model. Not betting advice.
        </p>
        <div className="mt-3 flex items-center gap-2 font-data text-xs text-muted-foreground">
          {wsStatus === "live" ? (
            <><span className="live-dot inline-block h-2 w-2 rounded-full" style={{ background: "hsl(var(--live))" }} />
              live — updates automatically</>
          ) : wsStatus === "connecting" ? (
            <><RefreshCw className="h-3 w-3 animate-spin" /> connecting…</>
          ) : (
            <><WifiOff className="h-3 w-3" /> live feed unavailable — showing last fetch</>
          )}
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

      {tab === "competitions" ? (
        <CompetitionsTab
          leagues={leagues.map((l) => ({ id: l.id, name: l.name, country: l.country }))}
          onPick={(id) => { setLeagueId(id); setTab("all"); }}
        />
      ) : (
        <>
          <FilterBar status={status} onStatus={setStatus} liveCount={liveCount}
            oddsShown={oddsShown} onOddsToggle={() => setOddsShown((v) => !v)} />
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
                onToggleFavourite={() => toggle(g.league.id)}
                renderMatch={(m) => (
                  <MatchCard key={m.id} match={m} league={leagueById.get(m.league_id)} oddsShown={oddsShown} />
                )} />
            ))}
          </section>
        </>
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
