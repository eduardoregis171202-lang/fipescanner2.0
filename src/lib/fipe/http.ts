const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type FetchJsonErrorCode =
  | "no_response"
  | "timeout"
  | `http_${number}`
  | "parse_error";

export class FetchJsonError extends Error {
  code: FetchJsonErrorCode;
  status?: number;

  constructor(code: FetchJsonErrorCode, message: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 408 || status === 502 || status === 503 || status === 504;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function fetchJsonWithRetry<T>(
  url: string,
  options?: {
    retries?: number;
    baseDelayMs?: number;
    timeoutMs?: number;
  }
): Promise<T> {
  const retries = options?.retries ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 350;
  const timeoutMs = options?.timeoutMs ?? 10_000;

  let lastStatus: number | undefined;
  let lastErr: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetchWithTimeout(url, timeoutMs);
      lastStatus = res.status;

      if (!res.ok) {
        if (isRetryableStatus(res.status) && i < retries - 1) {
          await delay(baseDelayMs * (i + 2));
          continue;
        }
        throw new FetchJsonError(`http_${res.status}`, `HTTP ${res.status}`, res.status);
      }

      try {
        return (await res.json()) as T;
      } catch {
        throw new FetchJsonError("parse_error", "Falha ao ler JSON");
      }
    } catch (e) {
      lastErr = e;

      // Preserve explicit HTTP errors
      if (e instanceof FetchJsonError && e.code.startsWith("http_")) {
        throw e;
      }

      const isAbort =
        typeof e === "object" &&
        e !== null &&
        "name" in e &&
        (e as { name?: string }).name === "AbortError";

      if (i < retries - 1) {
        await delay(baseDelayMs * (i + 1));
        continue;
      }

      if (isAbort) {
        throw new FetchJsonError("timeout", "Tempo esgotado");
      }

      // If we did get a non-ok Response at some point, surface its status.
      if (typeof lastStatus === "number") {
        throw new FetchJsonError(`http_${lastStatus}`, `HTTP ${lastStatus}`, lastStatus);
      }

      throw new FetchJsonError("no_response", "Sem resposta da rede");
    }
  }

  // Should be unreachable, but keep TS happy
  throw lastErr instanceof Error ? lastErr : new FetchJsonError("no_response", "Sem resposta da rede");
}
