"use client";

import { ChevronDown, CornerDownRight, RefreshCw, WifiOff } from "lucide-react";
import * as React from "react";

/* ---------------------------------------------------------------- types */

type League = { id: number; api_league_id: number; name: string; country: string | null };
type Team = { id: number; name: string; logo_url: string | null };
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

/* ------------------------------------------------------------- API base */

function apiBase(): string {
  if (process.env.NEXT_PUBLIC_PREDICTOR_API) return process.env.NEXT_PUBLIC_PREDICTOR_API;
  if (typeof window !== "undefined" && window.location.hostname.endsWith("hulsambath.me"))
    return "https://predictor-api.hulsambath.me";
  return "http://localhost:8000";
}
const wsBase = () => apiBase().replace(/^http/, "ws");

/* -------------------------------------------------------------- helpers */

const pct = (p: number | null | undefined) =>
  p == null ? "–" : `${Math.round(p * 100)}%`;

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "short",
  });
}
function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit",
  });
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

/* ----------------------------------------------------------- components */

function TeamBadge({ team }: { team: Team }) {
  const [broken, setBroken] = React.useState(false);
  const initials = team.name.replace(/[^A-Za-z0-9 ]/g, "").split(" ")
    .filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  if (team.logo_url && !broken)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={team.logo_url} alt="" width={26} height={26}
      className="h-[26px] w-[26px] shrink-0 rounded-full bg-secondary object-contain p-0.5"
      onError={() => setBroken(true)} />;
  return (
    <span aria-hidden className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-secondary font-display text-[11px] font-bold text-muted-foreground">
      {initials || "?"}
    </span>
  );
}

function TriBand({ p1, px, p2, from }: { p1: number; px: number; p2: number; from: "model" | "market" }) {
  const seg = [
    { key: "1", value: p1, color: "hsl(var(--home))" },
    { key: "X", value: px, color: "hsl(var(--draw))" },
    { key: "2", value: p2, color: "hsl(var(--away))" },
  ];
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-data text-[11px] text-muted-foreground">
        {seg.map((s) => (
          <span key={s.key}>
            <span className="mr-1 inline-block h-2 w-2 rounded-[2px]" style={{ background: s.color }} />
            {s.key} {pct(s.value)}
          </span>
        ))}
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted" role="img"
        aria-label={`${from} probabilities — home ${pct(p1)}, draw ${pct(px)}, away ${pct(p2)}`}>
        {seg.map((s) => (
          <div key={s.key} className="band-segment h-full"
            style={{ width: `${s.value * 100}%`, background: s.color }} />
        ))}
      </div>
      <div className="mt-1 text-right text-[10px] uppercase tracking-wide text-muted-foreground">
        {from === "model" ? "model" : "market implied"}
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

function OddsRow({ odds }: { odds: Odds }) {
  const cells = [["1", odds.home_win], ["X", odds.draw], ["2", odds.away_win],
    ["O2.5", odds.over_25], ["U2.5", odds.under_25]] as const;
  return (
    <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto">
      <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
        {odds.bookmaker ?? "odds"}
      </span>
      {cells.filter(([, v]) => v != null).map(([k, v]) => (
        <span key={k} className="shrink-0 rounded-md bg-secondary px-2 py-1 font-data text-xs">
          <span className="text-muted-foreground">{k}</span> {v!.toFixed(2)}
        </span>
      ))}
    </div>
  );
}

function MatchCard({ match, league }: { match: Match; league?: League }) {
  const [open, setOpen] = React.useState(false);
  const p = match.prediction;
  const probs = outcomeProbs(match);
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        className="w-full px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="mb-2.5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="font-data">{timeLabel(match.kickoff_utc)}</span>
            {league && (
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide">
                {league.name}
              </span>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
        <div className="mb-3 space-y-1.5">
          {([["home", match.home_team, p?.home_exp_goals],
             ["away", match.away_team, p?.away_exp_goals]] as const).map(([side, team, xg]) => (
            <div key={side} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2.5">
              <TeamBadge team={team} />
              <span className="truncate font-display text-lg font-semibold leading-tight">{team.name}</span>
              <span className="font-data text-xs text-muted-foreground">
                {xg != null ? `${xg.toFixed(2)} xG` : ""}
              </span>
            </div>
          ))}
        </div>
        {probs ? <TriBand {...probs} /> : (
          <p className="text-xs text-muted-foreground">No prices or prediction yet for this match.</p>
        )}
        {match.odds && <OddsRow odds={match.odds} />}
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

/* ----------------------------------------------------------------- page */

type WsStatus = "live" | "connecting" | "offline";

export default function PredictorPage() {
  const [leagues, setLeagues] = React.useState<League[]>([]);
  const [country, setCountry] = React.useState<string | null>(null);
  const [leagueId, setLeagueId] = React.useState<number | null>(null);
  const [matches, setMatches] = React.useState<Match[] | null>(null);
  const [recent, setRecent] = React.useState<Match[]>([]);
  const [wsStatus, setWsStatus] = React.useState<WsStatus>("connecting");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`${apiBase()}/leagues`).then((r) => r.json()).then(setLeagues)
      .catch(() => setError("The prediction server is not reachable right now."));
    fetch(`${apiBase()}/matches/upcoming`).then((r) => r.json()).then(setMatches)
      .catch(() => setError("The prediction server is not reachable right now."));
    fetch(`${apiBase()}/matches/recent?limit=30`).then((r) => r.json()).then(setRecent)
      .catch(() => {});
  }, []);

  // one unfiltered live socket; filtering is client-side so tabs are instant
  React.useEffect(() => {
    let closed = false;
    const ws = new WebSocket(`${wsBase()}/ws/matches`);
    ws.onopen = () => setWsStatus("live");
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "snapshot" || msg.type === "update") setMatches(msg.matches);
    };
    ws.onclose = () => { if (!closed) setWsStatus("offline"); };
    ws.onerror = () => { if (!closed) setWsStatus("offline"); };
    return () => { closed = true; ws.close(); };
  }, []);

  const countries = Array.from(new Set(leagues.map((l) => l.country ?? "International")));
  const visibleLeagues = country == null ? leagues
    : leagues.filter((l) => (l.country ?? "International") === country);
  const leagueById = new Map(leagues.map((l) => [l.id, l]));
  const activeLeagueIds = new Set(
    (leagueId != null ? leagues.filter((l) => l.id === leagueId) : visibleLeagues).map((l) => l.id));

  const filtered = (matches ?? []).filter((m) => activeLeagueIds.has(m.league_id));
  const filteredRecent = recent.filter((m) => activeLeagueIds.has(m.league_id));

  const byDay: [string, Match[]][] = [];
  for (const m of filtered) {
    const label = dayLabel(m.kickoff_utc);
    const last = byDay[byDay.length - 1];
    if (last && last[0] === label) last[1].push(m);
    else byDay.push([label, [m]]);
  }

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 font-display text-sm font-semibold uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${
      active ? "border-foreground bg-foreground text-background"
             : "border-border text-muted-foreground hover:text-foreground"}`;

  return (
    <main className="predictor-page mx-auto min-h-screen max-w-3xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <p className="font-data text-xs text-muted-foreground">hulsambath.me / predictor</p>
        <h1 className="font-display text-4xl font-bold uppercase leading-none sm:text-5xl">
          Matchday model
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Fixtures and bookmaker prices from the 1xbet line, goal and corners
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

      <nav className="mb-3 flex flex-wrap gap-2" aria-label="Country">
        <button className={chip(country == null)} onClick={() => { setCountry(null); setLeagueId(null); }}>
          All countries
        </button>
        {countries.map((c) => (
          <button key={c} className={chip(country === c)}
            onClick={() => { setCountry(c); setLeagueId(null); }}>
            {c}
          </button>
        ))}
      </nav>
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="League">
        <button className={chip(leagueId == null)} onClick={() => setLeagueId(null)}>
          All leagues
        </button>
        {visibleLeagues.map((l) => (
          <button key={l.id} className={chip(leagueId === l.id)} onClick={() => setLeagueId(l.id)}>
            {l.name}
          </button>
        ))}
      </nav>

      <section aria-label="Upcoming matches">
        {matches === null && !error && (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading fixtures…</p>
        )}
        {matches !== null && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nothing on the schedule for this filter right now. Fixtures appear
            after the next data sync.
          </div>
        )}
        {byDay.map(([label, ms]) => (
          <div key={label} className="mb-6">
            <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </h2>
            <div className="space-y-3">
              {ms.map((m) => <MatchCard key={m.id} match={m} league={leagueById.get(m.league_id)} />)}
            </div>
          </div>
        ))}
      </section>

      {filteredRecent.length > 0 && (
        <section aria-label="Recent results" className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold uppercase">Recent results</h2>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {filteredRecent.slice(0, 10).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <TeamBadge team={m.home_team} />
                  <span className="truncate">
                    {m.home_team.name} <span className="text-muted-foreground">vs</span> {m.away_team.name}
                  </span>
                </span>
                <span className="font-data shrink-0">{m.home_goals}–{m.away_goals}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-12 border-t border-border pt-4 text-xs text-muted-foreground">
        Built on a FastAPI + PostgreSQL Poisson model.{" "}
        <a className="underline underline-offset-2 hover:text-foreground" href="https://hulsambath.me">
          ← back to hulsambath.me
        </a>
      </footer>
    </main>
  );
}
