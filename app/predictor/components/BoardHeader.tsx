"use client";

import * as React from "react";
import { neu, neuPressable } from "../neu";

export type BoardTab = "all" | "favourites" | "competitions";

const TABS: { key: BoardTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "favourites", label: "Favourites" },
  { key: "competitions", label: "Competitions" },
];

export function BoardHeader({
  tab, onTab, favouriteCount, children,
}: {
  tab: BoardTab;
  onTab: (t: BoardTab) => void;
  favouriteCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <nav className={`${neu.inset} inline-flex gap-1 p-1`} aria-label="Board view">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => onTab(t.key)} aria-pressed={active}
                className={neuPressable(active, "px-4 py-1.5 font-display text-base font-bold uppercase tracking-wide")}>
                {t.label}
                {t.key === "favourites" && favouriteCount > 0 ? ` (${favouriteCount})` : ""}
              </button>
            );
          })}
        </nav>
      </div>
      <div>{children}</div>
    </div>
  );
}
