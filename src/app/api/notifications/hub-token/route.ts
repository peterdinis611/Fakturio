import { NextResponse } from "next/server";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";

type HubTokenResponse = {
  accessToken: string;
  expiresAt: string;
};

/** Proxies a short-lived SignalR hub JWT (tok=hub). Session JWT stays httpOnly. */
export async function GET() {
  try {
    const data = await apiFetch<HubTokenResponse>("/api/auth/hub-token", {
      cache: "no-store",
    });
    return NextResponse.json({
      accessToken: data.accessToken,
      expiresAt: data.expiresAt,
    });
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "hub_token_failed" }, { status: 502 });
  }
}
