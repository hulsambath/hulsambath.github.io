import { statRows, type MatchStats } from "../../detail";

export function MatchStatsBars({ stats }: { stats: MatchStats | null }) {
  const rows = statRows(stats);
  if (rows.length === 0) return null;
  return (
    <section className="mb-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Stats</h3>
      <div className="space-y-2">
        {rows.map((r) => {
          const total = (r.home ?? 0) + (r.away ?? 0) || 1;
          const hp = ((r.home ?? 0) / total) * 100;
          return (
            <div key={r.label}>
              <div className="mb-0.5 flex justify-between font-data text-xs">
                <span>{r.home ?? "–"}</span>
                <span className="text-muted-foreground">{r.label}</span>
                <span>{r.away ?? "–"}</span>
              </div>
              <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-[hsl(var(--home))]" style={{ width: `${hp}%` }} />
                <div className="h-full bg-[hsl(var(--away))]" style={{ width: `${100 - hp}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
