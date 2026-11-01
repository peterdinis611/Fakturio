import { NextResponse } from "next/server";
import { getAccessToken } from "@/shared/auth/session";

/** Exposes JWT for the browser SignalR client (httpOnly cookie → memory). */
export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ accessToken: token });
}
