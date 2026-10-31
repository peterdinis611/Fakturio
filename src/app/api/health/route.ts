import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/shared/api/client";

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

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          reason: "upstream" as const,
          status: res.status,
          latencyMs: Date.now() - started,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      reason: "ok" as const,
      latencyMs: Date.now() - started,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reach API";
    console.warn(`[health] API unreachable at ${base}: ${message}`);
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
