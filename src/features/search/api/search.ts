"use server";

import { apiFetch } from "@/shared/api/client";
import type { GlobalSearch, InvoiceStatus } from "@/shared/api/types";

export async function searchGlobal(params: {
  q: string;
  limit?: number;
  invoiceStatus?: InvoiceStatus;
}): Promise<GlobalSearch> {
  return apiFetch<GlobalSearch>("/api/search", {
    searchParams: {
      q: params.q,
      limit: params.limit ?? 30,
      invoiceStatus: params.invoiceStatus,
    },
    cache: "no-store",
  });
}
