"use server";

import { apiFetch } from "@/lib/api/client";
import type { AuditAction, AuditLogEntry, PagedResponse } from "@/lib/api/types";

export async function listAuditLogs(params?: {
  page?: number;
  pageSize?: number;
  action?: AuditAction;
  entityId?: string;
  search?: string;
  from?: string;
  to?: string;
}): Promise<PagedResponse<AuditLogEntry>> {
  return apiFetch<PagedResponse<AuditLogEntry>>("/api/logs", {
    searchParams: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
      action: params?.action,
      entityId: params?.entityId,
      search: params?.search,
      from: params?.from,
      to: params?.to,
    },
    next: { tags: ["audit-logs"], revalidate: 10 },
  });
}
