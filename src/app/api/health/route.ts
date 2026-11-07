import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/shared/api/client";
import { logger } from "@/shared/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Browser-facing health probe. Checks whether the API backend is reachable
 * from the Next.js server (not just whether the browser has a network link).
 */
export async function GET() {
  const base = getApiBaseUrl();
  const started = Date.now();

  try {
    const res = await fetch(`${base}/api/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });

    const body = (await res.json().catch(() => null)) as {
      status?: string;
      database?: string;
    } | null;

    if (!res.ok || body?.status !== "ok" || body?.database === "down") {
      return NextResponse.json(
        {
          ok: false,
          reason: (body?.database === "down"
            ? "database"
            : "upstream") as "database" | "upstream",
          status: res.status,
          database: body?.database ?? null,
          latencyMs: Date.now() - started,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      reason: "ok" as const,
      database: body?.database ?? "up",
      latencyMs: Date.now() - started,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reach API";
    logger.warn("health", `API unreachable at ${base}`, {
      detail: message,
      latencyMs: Date.now() - started,
    });
    return NextResponse.json(
      {
        ok: false,
        reason: "unreachable" as const,
        detail: message,
        target: `${base}/api/health`,
        latencyMs: Date.now() - started,
      },
      { status: 503 },
    );
  }
}
