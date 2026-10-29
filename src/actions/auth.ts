"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { isApiError } from "@/lib/api/errors";
import type { AppUser, AuthResponse } from "@/lib/api/types";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/auth/session";
import { ActionError, actionClient } from "@/lib/safe-action";
import { passwordMeetsPolicy } from "@/lib/password";

async function authSchemas() {
  const t = await getTranslations("Auth");
  return {
    register: z.object({
      email: z.email(t("emailInvalid")),
      password: z
        .string()
        .min(8, t("passwordTooShort"))
        .max(128)
        .refine(passwordMeetsPolicy, t("passwordWeak")),
      firstName: z.string().trim().max(100).optional().or(z.literal("")),
      lastName: z.string().trim().max(100).optional().or(z.literal("")),
    }),
    login: z.object({
      email: z.email(t("emailInvalid")),
      password: z.string().min(1, t("passwordRequired")).max(128),
    }),
  };
}

async function mapAuthApiError(error: unknown): Promise<never> {
  const t = await getTranslations("Auth");
  if (isApiError(error)) {
    const code = error.problem.code;
    if (code === "duplicate_email") throw new ActionError(t("emailTaken"));
    if (code === "unauthorized" || error.status === 401)
      throw new ActionError(t("invalidCredentials"));
    throw new ActionError(error.message || t("authFailed"));
  }
  throw error;
}

async function persistSession(data: AuthResponse) {
  await setAccessToken(data.accessToken, data.expiresAt);
  return data.user;
}

export const registerAction = actionClient
  .inputSchema(async () => (await authSchemas()).register)
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<AuthResponse>("/api/auth/register", {
        method: "POST",
        skipAuth: true,
        body: {
          email: parsedInput.email,
          password: parsedInput.password,
          firstName: parsedInput.firstName || null,
          lastName: parsedInput.lastName || null,
        },
        cache: "no-store",
      });
      const user = await persistSession(data);
      revalidatePath("/", "layout");
      return user;
    } catch (error) {
      await mapAuthApiError(error);
    }
  });

export const loginAction = actionClient
  .inputSchema(async () => (await authSchemas()).login)
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        skipAuth: true,
        body: {
          email: parsedInput.email,
          password: parsedInput.password,
        },
        cache: "no-store",
      });
      const user = await persistSession(data);
      revalidatePath("/", "layout");
      return user;
    } catch (error) {
      await mapAuthApiError(error);
    }
  });

export async function logoutAction(): Promise<void> {
  await clearAccessToken();
  revalidatePath("/", "layout");
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    return await apiFetch<AppUser>("/api/auth/me", { cache: "no-store" });
  } catch {
    await clearAccessToken();
    return null;
  }
}
