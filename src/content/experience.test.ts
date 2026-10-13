import { describe, expect, it } from "vitest";

import { experienceDuration, formatDuration } from "./experience.js";
import { site } from "./site.js";

describe("experienceDuration", () => {
  it("counts whole months from the start month", () => {
    expect(experienceDuration("2024-01", new Date("2026-10-14T00:00:00Z"))).toEqual({
      years: 2,
      months: 9,
    });
  });

  it("never rounds up a partial month", () => {
    expect(experienceDuration("2024-01", new Date("2026-12-31T23:00:00Z"))).toEqual({
      years: 2,
      months: 11,
    });
  });

  it("rolls over to a full year", () => {
    expect(experienceDuration("2024-01", new Date("2027-01-01T00:00:00Z"))).toEqual({
      years: 3,
      months: 0,
    });
  });
});

describe("formatDuration", () => {
  it("formats short and long forms", () => {
    expect(formatDuration({ years: 2, months: 9 })).toBe("2 yrs 9 mo");
    expect(formatDuration({ years: 2, months: 9 }, "long")).toBe("2 years 9 months");
  });

  it("handles singulars and zero parts", () => {
    expect(formatDuration({ years: 1, months: 1 }, "long")).toBe("1 year 1 month");
    expect(formatDuration({ years: 1, months: 0 })).toBe("1 yr");
    expect(formatDuration({ years: 0, months: 4 }, "long")).toBe("4 months");
  });
});

describe("site content", () => {
  it("does not hardcode experience durations", () => {
    const skills = Object.values(site.skills).flat();
    expect(skills.every((s) => !("years" in s))).toBe(true);
    expect(site.stats.find((s) => s.label === "Experience")?.value).toBe(site.career.short);
  });

  it("lists only employers under experience", () => {
    expect(site.experience.map((e) => e.company)).toEqual([
      "BookMeBus Co., Ltd.",
      "CamMob Co., Ltd.",
    ]);
  });
});
