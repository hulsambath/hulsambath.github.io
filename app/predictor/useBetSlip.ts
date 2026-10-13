"use client";

import * as React from "react";
import { SLIP_KEY, parseSlip, togglePick, type SlipPick } from "./slip";

export function useBetSlip() {
  const [picks, setPicks] = React.useState<SlipPick[]>([]);

  React.useEffect(() => {
    try { setPicks(parseSlip(localStorage.getItem(SLIP_KEY))); } catch { /* storage blocked */ }
  }, []);

  const save = React.useCallback((update: (prev: SlipPick[]) => SlipPick[]) => {
    setPicks((prev) => {
      const next = update(prev);
      try { localStorage.setItem(SLIP_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const toggle = React.useCallback((pick: SlipPick) => save((prev) => togglePick(prev, pick)), [save]);
  const remove = React.useCallback((matchId: number) => save((prev) => prev.filter((p) => p.matchId !== matchId)), [save]);
  const clear = React.useCallback(() => save(() => []), [save]);

  return { picks, toggle, remove, clear };
}
