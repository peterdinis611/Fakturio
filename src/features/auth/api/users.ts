"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/features/auth/api/auth";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type { AppUser, PagedResponse } from "@/shared/api/types";
import { ActionError, actionClient } from "@/shared/lib/safe-action";

/** Kept for layout compatibility — session is already JWT cookie based. */
export async function ensureCurrentUser(): Promise<AppUser | null> {
  return getCurrentUser();
}

export async function listUsers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PagedResponse<AppUser>> {
  return apiFetch<PagedResponse<AppUser>>("/api/users", {
    searchParams: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
      search: params?.search,
    },
    next: { tags: ["users"], revalidate: 20 },
  });
}

export async function getUser(id: string): Promise<AppUser> {
  return apiFetch<AppUser>(`/api/users/${id}`, {
    next: { tags: [`user-${id}`, "users"], revalidate: 20 },
  });
}

const updateUserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().max(100).nullable().optional(),
  lastName: z.string().max(100).nullable().optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  email: z.string().email().max(200).optional(),
});

export const updateUserAction = actionClient
  .inputSchema(updateUserSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...body } = parsedInput;
    try {
      const data = await apiFetch<AppUser>(`/api/users/${id}`, {
        method: "PUT",
        body,
      });
      revalidateTag("users", "max");
      revalidateTag(`user-${id}`, "max");
      revalidatePath("/profile");
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

const changePasswordSchema = z.object({
  id: z.string().uuid(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const changePasswordAction = actionClient
  .inputSchema(changePasswordSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...body } = parsedInput;
    try {
      await apiFetch<void>(`/api/users/${id}/change-password`, {
        method: "POST",
        body,
      });
      return { ok: true as const };
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
