import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./predictor.css";

export const metadata: Metadata = {
  title: "Matchday Model — Poisson football predictions | Sambath HUL",
  description:
    "Time-weighted Poisson goal and corners predictions for the Premier League, La Liga and Serie A. A live ML side project by Sambath HUL.",
};

export default function PredictorLayout({ children }: { children: ReactNode }) {
  return children;
}
