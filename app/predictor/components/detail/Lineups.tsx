import type { Lineups as LineupsT } from "../../detail";

export function Lineups({ lineups }: { lineups: LineupsT | null }) {
  if (!lineups || (lineups.home.length === 0 && lineups.away.length === 0)) return null;
  const col = (players: LineupsT["home"], formation: string | null) => (
    <div className="flex-1">
      <div className="mb-1 font-data text-[11px] text-muted-foreground">{formation ?? ""}</div>
      <ul className="space-y-0.5">
        {players.map((p, i) => (
          <li key={i} className={`flex gap-2 text-sm ${p.isStarter ? "" : "text-muted-foreground"}`}>
            <span className="w-5 font-data text-xs text-muted-foreground">{p.number ?? ""}</span>
            <span className="truncate">{p.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <section className="mb-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Lineups</h3>
      <div className="flex gap-4">
        {col(lineups.home, lineups.formationHome)}
        {col(lineups.away, lineups.formationAway)}
      </div>
    </section>
  );
}
