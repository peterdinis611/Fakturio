import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth/constants";

export { AUTH_COOKIE };

export async function getAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE)?.value ?? null;
}

export async function setAccessToken(
  token: string,
  expiresAt: string | Date,
): Promise<void> {
  const jar = await cookies();
  const expires =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;

  jar.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function clearAccessToken(): Promise<void> {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await getAccessToken());
}
