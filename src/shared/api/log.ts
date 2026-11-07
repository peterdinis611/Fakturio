import type { ApiProblem } from "./types";

type ApiLogContext = {
  method: string;
  path: string;
  status?: number;
  problem?: ApiProblem;
  cause?: unknown;
};

function serializeCause(cause: unknown): string | undefined {
  if (cause == null) return undefined;
  if (cause instanceof Error) {
    return cause.message || cause.name;
  }
  return String(cause);
}

/** Structured server-side log for API failures (dev terminal / Node logs). */
export function logApiFailure(ctx: ApiLogContext): void {
  const payload = {
    method: ctx.method.toUpperCase(),
    path: ctx.path,
    status: ctx.status ?? 0,
    code: ctx.problem?.code ?? null,
    title: ctx.problem?.title ?? null,
    detail: ctx.problem?.detail ?? null,
    cause: serializeCause(ctx.cause) ?? null,
  };

  // console.warn — Next.js overlays console.error from Server Components.
  console.warn(
    `[api] ${payload.method} ${payload.path} → ${payload.status}` +
      (payload.code ? ` (${payload.code})` : "") +
      (payload.detail ? `: ${payload.detail}` : ""),
    payload,
  );
}

/** Safe-action / server-action failures with optional API context. */
export function logActionFailure(
  scope: string,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  if (error && typeof error === "object" && "problem" in error) {
    const api = error as {
      status?: number;
      message?: string;
      problem?: ApiProblem;
    };
    console.error(`[${scope}]`, {
      message: api.message ?? null,
      status: api.status ?? null,
      code: api.problem?.code ?? null,
      title: api.problem?.title ?? null,
      detail: api.problem?.detail ?? null,
      ...extra,
    });
    return;
  }

  if (error instanceof Error) {
    console.error(`[${scope}]`, {
      name: error.name,
      message: error.message,
      ...extra,
    });
    return;
  }

  console.error(`[${scope}]`, { error, ...extra });
}
