import { cookies } from "next/headers";
import { ONBOARDING_SKIP_COOKIE } from "@/shared/auth/constants";

export async function isOnboardingSkipped(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(ONBOARDING_SKIP_COOKIE)?.value === "1";
}

export async function setOnboardingSkipped(): Promise<void> {
  const jar = await cookies();
  jar.set(ONBOARDING_SKIP_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // 1 year — soft preference until company is filled
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearOnboardingSkipped(): Promise<void> {
  const jar = await cookies();
  jar.delete(ONBOARDING_SKIP_COOKIE);
}
