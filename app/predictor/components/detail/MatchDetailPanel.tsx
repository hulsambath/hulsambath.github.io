"use client";

import { BarChart3, ClipboardList, LineChart, ListTree, Swords, X } from "lucide-react";
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
type PanelPrediction = {
  p_home?: number | null;
  p_draw?: number | null;
  p_away?: number | null;
  p_over_25?: number | null;
  p_btts?: number | null;
  top_scores?: { score: string; p: number }[] | null;
  exp_corners?: number | null;
  corners_lines?: Record<string, { over: number; under: number }> | null;
};
type PanelOdds = {
  bookmaker?: string | null;
  home_win?: number | null;
  draw?: number | null;
  away_win?: number | null;
  over_25?: number | null;
  under_25?: number | null;
  btts_yes?: number | null;
  btts_no?: number | null;
};

type DetailTab = "summary" | "stats" | "odds" | "lineups" | "h2h";

const TABS: { key: DetailTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "summary", label: "Summary", icon: ClipboardList },
  { key: "stats", label: "Stats", icon: BarChart3 },
  { key: "odds", label: "Odds", icon: LineChart },
  { key: "lineups", label: "Lineups", icon: ListTree },
  { key: "h2h", label: "H2H", icon: Swords },
];

const pct = (p: number | null | undefined) => p == null ? "-" : `${Math.round(p * 100)}%`;
const odd = (v: number | null | undefined) => v == null ? "-" : v.toFixed(2);
const fairOdd = (p: number | null | undefined) => (p && p > 0 ? 1 / p : null);

function PredictionSummary({ prediction }: { prediction: PanelPrediction | null }) {
  if (!prediction) {
    return <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">Prediction pending for this match.</p>;
  }
  const outcomes = [
    ["1", prediction.p_home],
    ["X", prediction.p_draw],
    ["2", prediction.p_away],
  ] as const;
  return (
    <section className="mb-4 rounded-xl border border-border bg-secondary/30 p-3">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Model probability</h3>
      <div className="grid grid-cols-3 gap-2">
        {outcomes.map(([label, value]) => (
          <div key={label} className="rounded-md border border-border bg-background/50 px-2 py-2 text-center">
            <div className="font-data text-[10px] text-muted-foreground">{label}</div>
            <div className="font-data text-base font-semibold">{pct(value)}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(prediction.top_scores ?? []).slice(0, 5).map((score) => (
          <span key={score.score} className="rounded-md border border-border px-2 py-1 font-data text-xs">
            {score.score} <span className="text-muted-foreground">{pct(score.p)}</span>
          </span>
        ))}
      </div>
      {(prediction.exp_corners != null || prediction.corners_lines) && (
        <div className="mt-3 rounded-lg border border-border bg-background/40 p-2">
          <div className="font-data text-[10px] uppercase tracking-wide text-muted-foreground">Corner prediction</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="rounded-md border border-border px-2 py-1 font-data text-xs">
              Expected <span className="text-foreground">{prediction.exp_corners?.toFixed(1) ?? "-"}</span>
            </span>
            {Object.entries(prediction.corners_lines ?? {}).map(([line, value]) => (
              <span key={line} className="rounded-md border border-border px-2 py-1 font-data text-xs">
                O{line} <span className="text-foreground">{pct(value.over)}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function OddsSummary({ odds, prediction }: { odds: PanelOdds | null; prediction: PanelPrediction | null }) {
  if (!odds && !prediction) {
    return <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">Odds unavailable for this match.</p>;
  }
  const cells = [
    ["1", odds?.home_win ?? fairOdd(prediction?.p_home), !odds?.home_win && prediction?.p_home != null],
    ["X", odds?.draw ?? fairOdd(prediction?.p_draw), !odds?.draw && prediction?.p_draw != null],
    ["2", odds?.away_win ?? fairOdd(prediction?.p_away), !odds?.away_win && prediction?.p_away != null],
    ["O2.5", odds?.over_25 ?? fairOdd(prediction?.p_over_25), !odds?.over_25 && prediction?.p_over_25 != null],
    ["U2.5", odds?.under_25 ?? fairOdd(prediction?.p_over_25 == null ? null : 1 - prediction.p_over_25), !odds?.under_25 && prediction?.p_over_25 != null],
    ["BTTS", odds?.btts_yes ?? fairOdd(prediction?.p_btts), !odds?.btts_yes && prediction?.p_btts != null],
  ] as const;
  return (
    <section className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">{odds ? "Market odds" : "Model fair odds"}</h3>
        <span className="font-data text-[10px] uppercase tracking-wide text-muted-foreground">{odds?.bookmaker ?? "prediction"}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cells.map(([label, value, fair]) => (
          <div key={label} className={`rounded-md border px-2 py-2 text-center ${fair ? "border-dashed border-border bg-secondary/20" : "border-border bg-secondary/35"}`}>
            <div className="font-data text-[10px] text-muted-foreground">{label}</div>
            <div className="font-data text-base font-semibold">{odd(value)}</div>
            {fair && <div className="font-data text-[9px] uppercase tracking-wide text-muted-foreground">fair</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function MatchDetailPanel({ matchId, onClose }: { matchId: number; onClose: () => void }) {
  const [detail, setDetail] = React.useState<MatchDetail | null>(null);
  const [error, setError] = React.useState(false);
  const [tab, setTab] = React.useState<DetailTab>("summary");

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
  const prediction = (detail?.prediction ?? null) as PanelPrediction | null;
  const odds = (detail?.odds ?? null) as PanelOdds | null;
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
          <div className="sticky top-0 z-10 mb-4 flex gap-1 overflow-x-auto border-b border-border bg-card/95 pb-2 backdrop-blur">
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <button key={item.key} onClick={() => setTab(item.key)} aria-pressed={active}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 font-data text-[11px] uppercase tracking-wide ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}>
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
          {tab === "summary" && (
            <>
              <PredictionSummary prediction={prediction} />
              <Timeline incidents={detail.incidents} />
              <TeamForm home={detail.home_form} away={detail.away_form}
                homeName={m?.home_team?.name ?? ""} awayName={m?.away_team?.name ?? ""} />
            </>
          )}
          {tab === "stats" && <MatchStatsBars stats={detail.stats} />}
          {tab === "odds" && <OddsSummary odds={odds} prediction={prediction} />}
          {tab === "lineups" && <Lineups lineups={detail.lineups} />}
          {tab === "h2h" && <HeadToHead h2h={detail.h2h} />}
        </div>
      )}
    </div>
  );
}
