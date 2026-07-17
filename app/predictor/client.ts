import { apiBase } from "./apiBase";
import type { DateBucket, League, Match, MatchDetail, Prediction } from "./types";

export class PredictorApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "PredictorApiError";
  }
}

async function responseError(response: Response, fallback: string): Promise<PredictorApiError> {
  let detail = fallback;
  try {
    const body = await response.json() as { detail?: unknown };
    if (typeof body.detail === "string" && body.detail.trim()) detail = body.detail;
  } catch {
    // Some upstream/proxy errors are HTML or empty. Keep the stable fallback.
  }
  return new PredictorApiError(response.status, detail);
}

async function readJson<T>(path: string): Promise<T> {
  const candidates = path.startsWith("/api/v1/")
    ? [path, path.replace(/^\/api\/v1/, "")]
    : [`/api/v1${path}`, path];

  let lastError: Error | null = null;
  for (const candidate of candidates) {
    const response = await fetch(`${apiBase()}${candidate}`, {
      signal: AbortSignal.timeout(15000)
    });
    if (response.ok) return response.json() as Promise<T>;
    if (response.status !== 404) {
      throw await responseError(response, `request failed: ${response.status}`);
    }
    lastError = await responseError(response, `request failed: ${response.status}`);
  }
  throw lastError ?? new Error("request failed");
}

export function fetchLeagues(): Promise<League[]> {
  return readJson<League[]>("/leagues");
}

export function fetchDateBuckets(): Promise<DateBucket[]> {
  return readJson<DateBucket[]>("/matches/dates");
}

export function fetchMatchesByDate(date: string): Promise<Match[]> {
  return readJson<Match[]>(`/matches/by-date?date=${encodeURIComponent(date)}`);
}

export function fetchMatchDetail(matchId: number): Promise<MatchDetail> {
  return readJson<MatchDetail>(`/matches/${matchId}/detail`);
}

/**
 * On-demand AI prediction for one match.
 *
 * The endpoint replies with Cache-Control/ETag. `force: false` permits a
 * browser cache hit; `force: true` revalidates with the server. The server may
 * still reuse an idempotent prediction when its model inputs are unchanged.
 */
export async function predictMatch(
  matchId: number,
  { force = false }: { force?: boolean } = {},
): Promise<Prediction> {
  const path = `/predictions/${matchId}/predict`;
  const candidates = [`/api/v1${path}`, path];

  let lastError: Error | null = null;
  for (const candidate of candidates) {
    const response = await fetch(`${apiBase()}${candidate}`, {
      cache: force ? "reload" : "default",
      // Fresh model generation can take a while — allow a long window.
      signal: AbortSignal.timeout(120000),
    });
    if (response.ok) return response.json() as Promise<Prediction>;
    if (response.status !== 404) {
      throw await responseError(response, `prediction failed: ${response.status}`);
    }
    lastError = await responseError(response, `prediction failed: ${response.status}`);
  }
  throw lastError ?? new Error("prediction failed");
}

export function predictionErrorMessage(error: unknown): string {
  if (!(error instanceof PredictorApiError)) {
    return "Prediction unavailable right now. Try again shortly.";
  }
  if (error.status === 404) return "On-demand predictions are not available on this server yet.";
  if (error.status === 409) return "This match has already started, so a new prediction cannot be generated.";
  if (error.status === 429) return "Prediction limit reached. Wait a minute and try again.";
  if (error.status === 503) return "The prediction service is not configured on this server.";
  if (error.status === 502) return "The prediction provider is temporarily unavailable.";
  return error.message || "Prediction unavailable right now. Try again shortly.";
}
