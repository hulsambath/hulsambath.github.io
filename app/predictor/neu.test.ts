import { describe, expect, it } from "vitest";
import { neu, neuPressable } from "./neu";

describe("neubrutalist class helpers", () => {
  it("marks active controls so CSS can fill them with the accent", () => {
    const cls = neuPressable(true);
    expect(cls).toContain(neu.pressable);
    expect(cls).toContain("is-active");
    expect(cls).toContain("text-foreground");
    expect(cls).not.toContain("neu-accent");
  });

  it("keeps idle controls on solid ink text", () => {
    const cls = neuPressable(false, "px-3");
    expect(cls).not.toContain("is-active");
    expect(cls).toContain("text-foreground");
    expect(cls.endsWith("px-3")).toBe(true);
  });
});
