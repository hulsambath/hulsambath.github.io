"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { boardHref, parseBoardParams } from "../routes";

/** Legacy `/predictor/match?id=…` links: the board now opens matches in place
 *  (`/predictor?match=…`), so forward old links there. */
export function MatchPageClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { matchId } = parseBoardParams({ get: (key) => (key === "match" ? params.get("id") : null) });

  React.useEffect(() => {
    router.replace(boardHref({ matchId }));
  }, [router, matchId]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-sm text-muted-foreground">
      {matchId == null ? "Match id is missing or invalid — opening the board…" : "Opening match…"}
    </main>
  );
}
