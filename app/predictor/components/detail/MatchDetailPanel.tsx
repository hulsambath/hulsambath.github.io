"use client";

import { BarChart3, ClipboardList, LineChart, ListTree, Loader2, Sparkles, Swords, X } from "lucide-react";
import * as React from "react";
import { fetchMatchDetail, predictMatch, predictionErrorMessage } from "../../client";
import { isLive } from "../../board";
import { useBetSlip } from "../../useBetSlip";
import { neu, neuPressable } from "../../neu";
import type { MatchDetail, Match, Odds, Prediction } from "../../types";
import { BetSlip } from "./BetSlip";
import { DetailHeader } from "./DetailHeader";
import { HeadToHead } from "./HeadToHead";
import { Lineups } from "./Lineups";
import { MatchStatsBars } from "./MatchStatsBars";
import { OddsMarkets } from "./OddsMarkets";
import { TeamForm } from "./TeamForm";
import { Timeline } from "./Timeline";

type PanelMatch = Match;
type PanelPrediction = {
  model_version?: string;
  created_at?: string;
  p_home?: number | null;
  p_draw?: number | null;
  p_away?: number | null;
  p_over_25?: number | null;
  p_btts?: number | null;
  top_scores?: { score: string; p: number }[] | null;
  exp_corners?: number | null;
  corners_lines?: Record<string, { over: number; under: number }> | null;
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
const timestamp = (value: string | null | undefined) => value
  ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
  : null;

function PredictButton({ hasPrediction, predicting, canPredict, onPredict }: {
  hasPrediction: boolean;
  predicting: boolean;
  canPredict: boolean;
  onPredict: () => void;
}) {
  if (!canPredict) return null;
  return (
    <button onClick={onPredict} disabled={predicting}
      className={neuPressable(false, "flex items-center gap-1.5 px-2.5 py-1.5 font-data text-[11px] uppercase tracking-wide disabled:opacity-60")}>
      {predicting
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <Sparkles className="h-3.5 w-3.5" />}
      {predicting ? "Predicting…" : hasPrediction ? "Refresh prediction" : "Predict"}
    </button>
  );
}

function PredictionSummary({ prediction, predicting, predictError, canPredict, onPredict }: {
  prediction: PanelPrediction | null;
  predicting: boolean;
  predictError: string | null;
  canPredict: boolean;
  onPredict: () => void;
}) {
  if (!prediction) {
    return (
      <section className={`${neu.inset} mb-4 p-3`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {canPredict ? "No prediction yet for this match." : "Prediction pending for this match."}
          </p>
          <PredictButton hasPrediction={false} predicting={predicting}
            canPredict={canPredict} onPredict={onPredict} />
        </div>
        {predictError && <p className="mt-2 text-xs text-destructive">{predictError}</p>}
      </section>
    );
  }
  const outcomes = [
    ["1", prediction.p_home],
    ["X", prediction.p_draw],
    ["2", prediction.p_away],
  ] as const;
  return (
    <section className={`${neu.raised} mb-4 p-4`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Model probability</h3>
        <PredictButton hasPrediction predicting={predicting}
          canPredict={canPredict} onPredict={onPredict} />
      </div>
      {predictError && <p className="mb-2 text-xs text-destructive">{predictError}</p>}
      {(prediction.model_version || prediction.created_at) && (
        <p className="mb-2 font-data text-[10px] text-muted-foreground">
          {prediction.model_version ?? "Prediction"}
          {prediction.created_at ? ` · generated ${timestamp(prediction.created_at)}` : ""}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2">
        {outcomes.map(([label, value]) => (
          <div key={label} className={`${neu.insetSm} px-2 py-2 text-center`}>
            <div className="font-data text-[10px] text-muted-foreground">{label}</div>
            <div className="font-data text-base font-semibold">{pct(value)}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(prediction.top_scores ?? []).slice(0, 5).map((score) => (
          <span key={score.score} className={`${neu.raisedSm} px-2 py-1 font-data text-xs`}>
            {score.score} <span className="text-muted-foreground">{pct(score.p)}</span>
          </span>
        ))}
      </div>
      {(prediction.exp_corners != null || prediction.corners_lines) && (
        <div className={`${neu.inset} mt-3 p-2.5`}>
          <div className="font-data text-[10px] uppercase tracking-wide text-muted-foreground">Corner prediction</div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <span className={`${neu.raisedSm} px-2 py-1 font-data text-xs`}>
              Expected <span className="text-foreground">{prediction.exp_corners?.toFixed(1) ?? "-"}</span>
            </span>
            {Object.entries(prediction.corners_lines ?? {}).map(([line, value]) => (
              <span key={line} className={`${neu.raisedSm} px-2 py-1 font-data text-xs`}>
                O{line} <span className="text-foreground">{pct(value.over)}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function MatchDetailPanel({ matchId, onClose, onPrediction }: {
  matchId: number;
  onClose: () => void;
  onPrediction?: (matchId: number, prediction: Prediction) => void;
}) {
  const [detail, setDetail] = React.useState<MatchDetail | null>(null);
  const [error, setError] = React.useState(false);
  const [tab, setTab] = React.useState<DetailTab>("summary");
  const [predictionOverride, setPredictionOverride] = React.useState<PanelPrediction | null>(null);
  const [predicting, setPredicting] = React.useState(false);
  const [predictError, setPredictError] = React.useState<string | null>(null);
  const slip = useBetSlip();

  React.useEffect(() => {
    let active = true;
    let timer: number | undefined;

    const load = () => {
      fetchMatchDetail(matchId)
        .then((d) => {
          if (!active) return;
          setDetail(d);
          setError(false);
          if (d.match?.status && isLive(d.match.status)) {
            timer = window.setTimeout(load, 15000);
          } else {
            if (timer) window.clearTimeout(timer);
          }
        })
        .catch(() => {
          if (!active) return;
          setDetail((prev) => {
             if (!prev) setError(true);
             return prev;
          });
        });
    };

    setDetail(null);
    setError(false);
    setPredictionOverride(null);
    setPredicting(false);
    setPredictError(null);
    load();

    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [matchId]);

  const m = detail?.match as PanelMatch | undefined;
  const prediction = (predictionOverride ?? detail?.prediction ?? null) as PanelPrediction | null;
  const odds: Odds | null = detail?.odds ?? null;
  const canPredict = m?.status === "NS";
  const hasPrediction = prediction != null;

  const handlePredict = React.useCallback(async () => {
    setPredicting(true);
    setPredictError(null);
    try {
      // A refresh revalidates with the server. The backend remains
      // idempotent and may reuse the result while its inputs are unchanged.
      const fresh = await predictMatch(matchId, { force: hasPrediction });
      setPredictionOverride(fresh as PanelPrediction);
      onPrediction?.(matchId, fresh);
    } catch (predictFailure) {
      setPredictError(predictionErrorMessage(predictFailure));
    } finally {
      setPredicting(false);
    }
  }, [matchId, hasPrediction, onPrediction]);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <button onClick={onClose} aria-label="Close details"
        className={neuPressable(false, "mb-3 ml-auto rounded-full p-1.5 xl:hidden")}>
        <X className="h-5 w-5" />
      </button>
      {error && <p className="py-8 text-center text-sm text-muted-foreground">Details unavailable right now.</p>}
      {!error && !detail && <p className="py-8 text-center text-sm text-muted-foreground">Loading details…</p>}
      {detail && (
        <div className="-mx-2 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <DetailHeader detail={detail} />
          <div className="-mt-2 mb-4 flex flex-wrap gap-x-2 gap-y-1 font-data text-[10px] uppercase tracking-wide text-muted-foreground">
            <span>Source: {m?.source ?? "unknown"}</span>
            {m?.provider_updated_at && <span>Feed: {timestamp(m.provider_updated_at)}</span>}
            {detail.detail_fetched_at && <span>Details: {timestamp(detail.detail_fetched_at)}</span>}
          </div>
          <div className="neu-surface sticky top-0 z-10 mb-4 py-1">
            <div className={`${neu.inset} flex gap-1 overflow-x-auto p-1`}>
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <button key={item.key} onClick={() => setTab(item.key)} aria-pressed={active}
                  className={neuPressable(active, "flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 font-data text-[11px] uppercase tracking-wide")}>
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
            </div>
          </div>
          {tab === "summary" && (
            <>
              <PredictionSummary prediction={prediction} predicting={predicting}
                predictError={predictError} canPredict={canPredict}
                onPredict={handlePredict} />
              <Timeline incidents={detail.incidents} />
              <TeamForm home={detail.home_form} away={detail.away_form}
                homeName={m?.home_team?.name ?? ""} awayName={m?.away_team?.name ?? ""} />
            </>
          )}
          {tab === "stats" && <MatchStatsBars stats={detail.stats} />}
          {tab === "odds" && (
            <OddsMarkets odds={odds} matchId={matchId} picks={slip.picks} onPick={slip.toggle}
              matchLabel={`${m?.home_team?.name ?? "Home"} v ${m?.away_team?.name ?? "Away"}`} />
          )}
          {tab === "lineups" && <Lineups lineups={detail.lineups} />}
          {tab === "h2h" && <HeadToHead h2h={detail.h2h} />}
        </div>
      )}
      <BetSlip picks={slip.picks} onRemove={slip.remove} onClear={slip.clear} />
    </div>
  );
}
