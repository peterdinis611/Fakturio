"use server";

import { getCurrentUser } from "@/features/auth/api/auth";
import { apiFetch } from "@/shared/api/client";
import type { AppUser, PagedResponse } from "@/shared/api/types";

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
