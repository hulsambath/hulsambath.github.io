import { Suspense } from "react";

import { MatchPageClient } from "./MatchPageClient";

export default function MatchPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-12 text-sm text-muted-foreground">Loading match…</main>}>
      <MatchPageClient />
    </Suspense>
  );
}
