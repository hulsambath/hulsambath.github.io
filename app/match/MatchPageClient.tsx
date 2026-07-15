"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { MatchDetailPanel } from "../predictor/components/detail/MatchDetailPanel";

export function MatchPageClient() {
  const router = useRouter();
  const params = useSearchParams();
  const matchId = params.get("id") ? Number(params.get("id")) : NaN;

  if (!Number.isInteger(matchId) || matchId <= 0) {
    return <main className="mx-auto max-w-3xl px-4 py-12 text-sm text-muted-foreground">Match id is missing or invalid.</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <MatchDetailPanel matchId={matchId} onClose={() => router.push("/predictor")} />
    </main>
  );
}
