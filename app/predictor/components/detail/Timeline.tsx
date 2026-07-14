import type { Incident } from "../../detail";

export function Timeline({ incidents }: { incidents: Incident[] | null }) {
  if (!incidents || incidents.length === 0) return null;
  const icon = (i: Incident) => (i.type === "goal" ? "⚽" : i.detail === "red" ? "🟥" : "🟨");
  return (
    <section className="mb-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Timeline</h3>
      <ul className="space-y-1">
        {incidents.map((i, n) => (
          <li key={n} className={`flex items-center gap-2 text-sm ${i.team === "away" ? "flex-row-reverse text-right" : ""}`}>
            <span className="font-data text-xs text-muted-foreground">{i.minute != null ? `${i.minute}'` : ""}</span>
            <span aria-hidden>{icon(i)}</span>
            <span className="truncate">{i.player ?? ""}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
