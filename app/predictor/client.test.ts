import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PredictorApiError,
  predictMatch,
  predictionErrorMessage,
} from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("predictor prediction client", () => {
  it("prefers the versioned route and returns the server prediction", async () => {
    const prediction = { model_version: "gemini-test", created_at: "2026-07-17T00:00:00Z" };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(prediction), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(predictMatch(42)).resolves.toMatchObject(prediction);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/api/v1/predictions/42/predict");
  });

  it("falls back to the legacy route only when the versioned route is missing", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: "Not Found" }), { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ model_version: "fallback" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(predictMatch(7)).resolves.toMatchObject({ model_version: "fallback" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/predictions/7/predict");
  });

  it("maps server statuses to actionable UI messages", () => {
    expect(predictionErrorMessage(new PredictorApiError(404, "Not Found"))).toContain("not available");
    expect(predictionErrorMessage(new PredictorApiError(409, "started"))).toContain("already started");
    expect(predictionErrorMessage(new PredictorApiError(429, "limited"))).toContain("Wait a minute");
    expect(predictionErrorMessage(new PredictorApiError(503, "missing key"))).toContain("not configured");
  });
});
