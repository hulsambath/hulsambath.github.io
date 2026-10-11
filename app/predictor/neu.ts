/** Class names for the predictor's neumorphic surfaces; styles live in predictor.css. */
export const neu = {
  surface: "neu-surface",
  raised: "neu-raised",
  raisedSm: "neu-raised-sm",
  inset: "neu-inset",
  insetSm: "neu-inset-sm",
  pressable: "neu-pressable",
} as const;

/** A soft button: raised at rest, pressed-in and accent-coloured when active. */
export function neuPressable(active: boolean, extra = ""): string {
  const state = active
    ? "is-active text-[hsl(var(--neu-accent))]"
    : "text-muted-foreground hover:text-foreground";
  return [neu.pressable, state, extra].filter(Boolean).join(" ");
}
