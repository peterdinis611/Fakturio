"use server";

import { apiFetch } from "@/lib/api/client";
import type {
  AgingReport,
  MonthlyRevenue,
  ReportOverview,
  TopCustomersReport,
  VatReport,
} from "@/lib/api/types";

export async function getReportOverview(params?: {
  from?: string;
  to?: string;
}): Promise<ReportOverview> {
  return apiFetch<ReportOverview>("/api/reports/overview", {
    searchParams: { from: params?.from, to: params?.to },
    next: { tags: ["reports"], revalidate: 30 },
  });
}

export async function getMonthlyRevenue(year?: number): Promise<MonthlyRevenue> {
  return apiFetch<MonthlyRevenue>("/api/reports/revenue/monthly", {
    searchParams: { year },
    next: { tags: ["reports"], revalidate: 60 },
  });
}

export async function getAgingReport(
  largestLimit = 10,
): Promise<AgingReport> {
  return apiFetch<AgingReport>("/api/reports/aging", {
    searchParams: { largestLimit },
    next: { tags: ["reports"], revalidate: 30 },
  });
}

export async function getTopCustomers(params?: {
  from?: string;
  to?: string;
  limit?: number;
}): Promise<TopCustomersReport> {
  return apiFetch<TopCustomersReport>("/api/reports/customers/top", {
    searchParams: {
      from: params?.from,
      to: params?.to,
      limit: params?.limit ?? 10,
    },
    next: { tags: ["reports"], revalidate: 60 },
  });
}

export async function getVatReport(params?: {
  from?: string;
  to?: string;
}): Promise<VatReport> {
  return apiFetch<VatReport>("/api/reports/vat", {
    searchParams: { from: params?.from, to: params?.to },
    next: { tags: ["reports"], revalidate: 60 },
  });
}
