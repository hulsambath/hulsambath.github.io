import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./predictor.css";

export const metadata: Metadata = {
  title: "Matchday Board — live football odds & Poisson predictions | Sambath HUL",
  description:
    "Live fixtures, odds and time-weighted Poisson goal & corners predictions across ~30 competitions, fed by Sofascore. A live ML side project by Sambath HUL.",
};

export default function PredictorLayout({ children }: { children: ReactNode }) {
  return children;
}
