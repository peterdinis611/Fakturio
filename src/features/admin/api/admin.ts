"use server";

import { apiFetch } from "@/shared/api/client";
import type { AdminOverview, AdminUserSummary, PagedResponse } from "@/shared/api/types";

export async function getAdminOverview(): Promise<AdminOverview> {
  return apiFetch<AdminOverview>("/api/admin/overview", {
    cache: "no-store",
  });
}

export async function listAdminUsers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PagedResponse<AdminUserSummary>> {
  return apiFetch<PagedResponse<AdminUserSummary>>("/api/admin/users", {
    searchParams: {
      page: String(params?.page ?? 1),
      pageSize: String(params?.pageSize ?? 20),
      ...(params?.search ? { search: params.search } : {}),
    },
    cache: "no-store",
  });
}
