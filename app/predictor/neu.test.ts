import { describe, expect, it } from "vitest";
import { neu, neuPressable } from "./neu";

describe("neumorphic class helpers", () => {
  it("marks active controls with an inset shadow and accent text", () => {
    const cls = neuPressable(true);
    expect(cls).toContain(neu.pressable);
    expect(cls).toContain("is-active");
    expect(cls).toContain("text-[hsl(var(--neu-accent))]");
  });

  it("keeps idle controls raised with muted text", () => {
    const cls = neuPressable(false, "px-3");
    expect(cls).not.toContain("is-active");
    expect(cls).toContain("text-muted-foreground");
    expect(cls.endsWith("px-3")).toBe(true);
  });
});
