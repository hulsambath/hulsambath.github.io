"use client";

import * as React from "react";
import type { BoardLeague } from "../board";
import { neu, neuPressable } from "../neu";
import { CountryFlag } from "./CountryFlag";

export function CompetitionsTab({
  leagues, onPick,
}: {
  leagues: BoardLeague[];
  onPick: (id: number) => void;
}) {
  const [q, setQ] = React.useState("");
  const needle = q.trim().toLowerCase();
  const filtered = leagues
    .filter((l) =>
      !needle ||
      l.name.toLowerCase().includes(needle) ||
      (l.country ?? "").toLowerCase().includes(needle))
    .sort((a, b) =>
      (a.country ?? "").localeCompare(b.country ?? "") || a.name.localeCompare(b.name));

  return (
    <div>
      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search competitions…"
        className={`${neu.inset} neu-focus mb-4 w-full px-4 py-2.5 font-data text-sm placeholder:text-muted-foreground`}
      />
      <ul className="space-y-2.5 p-1">
        {filtered.map((l) => (
          <li key={l.id}>
            <button onClick={() => onPick(l.id)}
              className={neuPressable(false, "flex w-full items-center gap-2 px-3 py-2 text-left")}>
              <CountryFlag country={l.country} name={l.name} />
              <span className="min-w-0 flex-1 truncate font-display text-sm font-semibold">{l.name}</span>
              {l.country && <span className="shrink-0 text-[11px] text-muted-foreground/70">{l.country}</span>}
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">No competitions match “{q}”.</li>
        )}
      </ul>
    </div>
  );
}
