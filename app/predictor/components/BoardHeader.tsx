"use client";

import * as React from "react";

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
        <nav className="flex gap-4" aria-label="Board view">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => onTab(t.key)} aria-pressed={active}
                className={`relative pb-1 font-display text-lg font-bold uppercase tracking-wide transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t.label}
                {t.key === "favourites" && favouriteCount > 0 ? ` (${favouriteCount})` : ""}
                {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />}
              </button>
            );
          })}
        </nav>
      </div>
      <div>{children}</div>
    </div>
  );
}
