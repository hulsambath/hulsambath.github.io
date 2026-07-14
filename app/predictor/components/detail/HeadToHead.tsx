import type { H2HMatch } from "../../detail";

export function HeadToHead({ h2h }: { h2h: H2HMatch[] | null }) {
  if (!h2h || h2h.length === 0) return null;
  return (
    <section className="mb-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Head-to-head</h3>
      <ul className="space-y-1">
        {h2h.slice(0, 8).map((m, i) => (
          <li key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
            <span className="truncate text-right">{m.homeName}</span>
            <span className="font-data font-semibold">{m.homeGoals ?? "–"}–{m.awayGoals ?? "–"}</span>
            <span className="truncate">{m.awayName}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
