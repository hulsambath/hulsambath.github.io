import { formChip, type TeamForm as TeamFormT } from "../../detail";

export function TeamForm({ home, away, homeName, awayName }: {
  home: TeamFormT | null; away: TeamFormT | null; homeName: string; awayName: string;
}) {
  if (!home && !away) return null;
  const row = (name: string, form: TeamFormT | null) => (
    <div className="mb-2">
      <div className="mb-1 truncate text-sm font-semibold">{name}</div>
      <div className="flex gap-1">
        {(form?.recent ?? []).map((r, i) => {
          const c = formChip(r.result);
          return <span key={i} className={`flex h-5 w-5 items-center justify-center rounded font-data text-[11px] font-bold ${c.cls}`}>{c.label}</span>;
        })}
      </div>
    </div>
  );
  return (
    <section className="mb-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Form</h3>
      {row(homeName, home)}
      {row(awayName, away)}
    </section>
  );
}
