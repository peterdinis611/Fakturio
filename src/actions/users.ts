"use server";

import { currentUser } from "@clerk/nextjs/server";
import { apiFetch } from "@/lib/api/client";
import type { AppUser, PagedResponse } from "@/lib/api/types";

/**
 * After Clerk auth: pull profile from Clerk and upsert AppUser on the API.
 * Backend does not validate Clerk JWTs.
 */
export async function ensureCurrentUser(): Promise<AppUser | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;

  return apiFetch<AppUser>("/api/users/sync", {
    method: "POST",
    body: {
      clerkUserId: clerkUser.id,
      email: primaryEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
    cache: "no-store",
  });
}

export async function getCurrentAppUser(): Promise<AppUser | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  try {
    return await apiFetch<AppUser>("/api/users/me", {
      searchParams: { clerkUserId: clerkUser.id },
      cache: "no-store",
    });
  } catch {
    return null;
  }
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
