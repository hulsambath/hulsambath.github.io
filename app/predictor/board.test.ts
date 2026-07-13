import { describe, expect, it } from "vitest";
import { classify, countryFlag, isFinished, isLive } from "./board";

describe("countryFlag", () => {
  it("maps known countries to emoji flags", () => {
    expect(countryFlag("England")).toBe("🏴󠁧󠁢󠁥󠁮󠁧󠁿");
    expect(countryFlag("Brazil")).toBe("🇧🇷");
    expect(countryFlag("Argentina")).toBe("🇦🇷");
  });
  it("returns null for unknown / region names", () => {
    expect(countryFlag("World")).toBeNull();
    expect(countryFlag(null)).toBeNull();
    expect(countryFlag("International")).toBeNull();
  });
});

describe("status classification", () => {
  it("treats FT/AET/PEN as finished", () => {
    expect(isFinished("FT")).toBe(true);
    expect(classify("AET")).toBe("finished");
  });
  it("treats NS/PST/CANC as upcoming (not live)", () => {
    expect(isLive("NS")).toBe(false);
    expect(classify("NS")).toBe("upcoming");
    expect(classify("PST")).toBe("upcoming");
  });
  it("treats in-progress codes as live", () => {
    expect(isLive("1H")).toBe(true);
    expect(classify("HT")).toBe("live");
  });
});
