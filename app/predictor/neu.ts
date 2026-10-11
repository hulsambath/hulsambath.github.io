/** Class names for the predictor's neubrutalist surfaces; styles live in predictor.css. */
export const neu = {
  surface: "neu-surface",
  raised: "neu-raised",
  raisedSm: "neu-raised-sm",
  inset: "neu-inset",
  insetSm: "neu-inset-sm",
  pressable: "neu-pressable",
} as const;

/** A chunky button: ink border and hard shadow at rest, pressed flat and
 *  filled with the accent colour when active. */
export function neuPressable(active: boolean, extra = ""): string {
  const state = active ? "is-active text-foreground" : "text-foreground";
  return [neu.pressable, state, extra].filter(Boolean).join(" ");
}
