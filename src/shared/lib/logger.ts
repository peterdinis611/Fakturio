export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogFields = Record<string, unknown>;

const APP = "Fakturio.Web";
const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const SENSITIVE_KEY =
  /^(authorization|cookie|password|passwd|secret|token|accessToken|refreshToken|api[_-]?key)$/i;

function minLevel(): LogLevel {
  const raw = process.env.NEXT_PUBLIC_LOG_LEVEL ?? process.env.LOG_LEVEL;
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[minLevel()];
}

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY.test(key)) return "[Redacted]";
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...(process.env.NODE_ENV !== "production" && value.stack
        ? { stack: value.stack }
        : {}),
    };
  }
  if (Array.isArray(value)) {
    return value.map((item, i) => redactValue(String(i), item));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = redactValue(k, v);
    }
    return out;
  }
  return value;
}

function sanitize(fields?: LogFields): LogFields | undefined {
  if (!fields) return undefined;
  const out: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    out[key] = redactValue(key, value);
  }
  return out;
}

function consoleMethod(
  level: LogLevel,
  consoleLevel?: LogLevel,
): "debug" | "info" | "warn" | "error" | "log" {
  const effective = consoleLevel ?? level;
  if (effective === "debug") return "debug";
  if (effective === "info") return "info";
  if (effective === "warn") return "warn";
  return "error";
}

function formatDevTime(iso: string): string {
  return iso.slice(11, 19);
}

type EmitOptions = {
  /**
   * Override which console.* method is used.
   * Useful on the Next.js server: keep structured level=error but emit via
   * console.warn so RSC/dev overlays don't treat expected API failures as crashes.
   */
  consoleLevel?: LogLevel;
};

function emit(
  level: LogLevel,
  scope: string,
  message: string,
  fields?: LogFields,
  options?: EmitOptions,
): void {
  if (!shouldLog(level)) return;

  const time = new Date().toISOString();
  const safeFields = sanitize(fields);
  const method = consoleMethod(level, options?.consoleLevel);
  const sink = console[method].bind(console);

  if (process.env.NODE_ENV === "production") {
    sink(
      JSON.stringify({
        level,
        time,
        application: APP,
        scope,
        msg: message,
        ...safeFields,
      }),
    );
    return;
  }

  const prefix = `[${formatDevTime(time)} ${level.toUpperCase().padEnd(5)}] ${scope}`;
  if (safeFields && Object.keys(safeFields).length > 0) {
    sink(`${prefix} ${message}`, safeFields);
  } else {
    sink(`${prefix} ${message}`);
  }
}

export const logger = {
  debug(scope: string, message: string, fields?: LogFields): void {
    emit("debug", scope, message, fields);
  },
  info(scope: string, message: string, fields?: LogFields): void {
    emit("info", scope, message, fields);
  },
  warn(scope: string, message: string, fields?: LogFields): void {
    emit("warn", scope, message, fields);
  },
  error(
    scope: string,
    message: string,
    fields?: LogFields,
    options?: EmitOptions,
  ): void {
    emit("error", scope, message, fields, options);
  },
  /** Client / boundary crashes — always console.error. */
  clientError(
    scope: string,
    error: Error & { digest?: string },
    fields?: LogFields,
  ): void {
    emit("error", scope, error.message || error.name, {
      name: error.name,
      digest: error.digest ?? null,
      ...(process.env.NODE_ENV !== "production" && error.stack
        ? { stack: error.stack }
        : {}),
      ...fields,
    });
  },
};

export function createCorrelationId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export const CORRELATION_HEADER = "X-Correlation-ID";
