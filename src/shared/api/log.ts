import {
  logger,
  type LogFields,
  type LogLevel,
} from "@/shared/lib/logger";
import type { ApiProblem } from "./types";

type ApiLogContext = {
  method: string;
  path: string;
  status?: number;
  problem?: ApiProblem;
  cause?: unknown;
  correlationId?: string;
};

function serializeCause(cause: unknown): string | undefined {
  if (cause == null) return undefined;
  if (cause instanceof Error) {
    return cause.message || cause.name;
  }
  return String(cause);
}

function apiFailureLevel(status: number): LogLevel {
  if (status === 0 || status >= 500) return "error";
  return "warn";
}

/** Structured log for API failures (dev terminal / Node / browser console). */
export function logApiFailure(ctx: ApiLogContext): void {
  const status = ctx.status ?? 0;
  const level = apiFailureLevel(status);
  const method = ctx.method.toUpperCase();
  const code = ctx.problem?.code ?? null;
  const detail = ctx.problem?.detail ?? null;

  const message =
    `${method} ${ctx.path} → ${status}` +
    (code ? ` (${code})` : "") +
    (detail ? `: ${detail}` : "");

  const fields: LogFields = {
    method,
    path: ctx.path,
    status,
    code,
    title: ctx.problem?.title ?? null,
    detail,
    cause: serializeCause(ctx.cause) ?? null,
    correlationId: ctx.correlationId ?? null,
  };

  // Next.js overlays console.error from Server Components — keep console at warn
  // while preserving the structured level for aggregators.
  if (level === "error") {
    logger.error("api", message, fields, { consoleLevel: "warn" });
  } else {
    logger.warn("api", message, fields);
  }
}

function isAlreadyLoggedApiError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "wasLogged" in error &&
    (error as { wasLogged?: boolean }).wasLogged === true
  );
}

/** Safe-action / server-action failures with optional API context. */
export function logActionFailure(
  scope: string,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  if (isAlreadyLoggedApiError(error)) return;

  if (error && typeof error === "object" && "problem" in error) {
    const api = error as {
      status?: number;
      message?: string;
      problem?: ApiProblem;
      wasLogged?: boolean;
    };
    if (api.wasLogged) return;

    const status = api.status ?? 0;
    const level = apiFailureLevel(status);
    const fields: LogFields = {
      message: api.message ?? null,
      status: api.status ?? null,
      code: api.problem?.code ?? null,
      title: api.problem?.title ?? null,
      detail: api.problem?.detail ?? null,
      ...extra,
    };
    const msg = api.message ?? api.problem?.detail ?? "action failed";

    if (level === "error") {
      logger.error(scope, msg, fields, { consoleLevel: "warn" });
    } else {
      logger.warn(scope, msg, fields);
    }
    return;
  }

  if (error instanceof Error) {
    logger.error(
      scope,
      error.message || error.name,
      {
        name: error.name,
        ...extra,
      },
      { consoleLevel: "warn" },
    );
    return;
  }

  logger.error(scope, "action failed", { error, ...extra }, {
    consoleLevel: "warn",
  });
}
