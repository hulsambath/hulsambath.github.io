import type { Metadata } from "next";
import { Suspense } from "react";

import { MatchPageClient } from "./MatchPageClient";

export const metadata: Metadata = {
  title: "Match Detail — Poisson predictions & odds | Sambath HUL",
  description:
    "Detailed match view with Poisson goal & corner predictions, bookmaker odds, lineups, stats, head-to-head, and recent form.",
};

export default function MatchPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-12 text-sm text-muted-foreground">Loading match…</main>}>
      <MatchPageClient />
    </Suspense>
  );
}
