"use server";

import { revalidatePath } from "next/cache";
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

const registerSchema = z.object({
  email: z.email("Neplatný e-mail"),
  password: z.string().min(8, "Heslo musí mať aspoň 8 znakov").max(128),
  firstName: z.string().trim().max(100).optional().or(z.literal("")),
  lastName: z.string().trim().max(100).optional().or(z.literal("")),
});

const loginSchema = z.object({
  email: z.email("Neplatný e-mail"),
  password: z.string().min(1, "Heslo je povinné").max(128),
});

async function persistSession(data: AuthResponse) {
  await setAccessToken(data.accessToken, data.expiresAt);
  return data.user;
}

export const registerAction = actionClient
  .inputSchema(registerSchema)
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
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const loginAction = actionClient
  .inputSchema(loginSchema)
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
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
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
