import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/shared/auth/constants";
import { isValidAccessToken } from "@/shared/auth/verify-jwt";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  const authenticated = await isValidAccessToken(token);
  return NextResponse.json({ authenticated });
}
