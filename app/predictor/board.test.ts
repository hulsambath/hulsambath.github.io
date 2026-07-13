import { describe, expect, it } from "vitest";
import { classify, isFinished, isLive } from "./board";

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
