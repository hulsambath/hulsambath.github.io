import { h2hRows, type H2HMatch } from "../../detail";
import { Crest } from "../Crest";

export function HeadToHead({ h2h }: { h2h: H2HMatch[] | null }) {
  const rows = h2hRows(h2h);
  if (rows.length === 0) return null;
  return (
    <section className="mb-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Head-to-head</h3>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.key} className="text-sm">
            {row.date && <div className="mb-0.5 text-center font-data text-[10px] text-muted-foreground">{row.date}</div>}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <span className="flex min-w-0 items-center justify-end gap-1.5">
                <span className="truncate">{row.home.name}</span>
                <Crest src={row.home.logo} name={row.home.name} size={20} />
              </span>
              <span className="font-data font-semibold">{row.home.goals ?? "–"}–{row.away.goals ?? "–"}</span>
              <span className="flex min-w-0 items-center gap-1.5">
                <Crest src={row.away.logo} name={row.away.name} size={20} />
                <span className="truncate">{row.away.name}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
