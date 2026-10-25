"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { apiFetch } from "@/lib/api/client";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceListItem,
  InvoiceReminder,
  InvoiceStats,
  InvoiceStatus,
  InvoiceStatusResponse,
  PagedResponse,
  SyncOverdueResponse,
  UpdateInvoiceInput,
} from "@/lib/api/types";
import {
  cancelSchema,
  invoiceSchema,
  type InvoiceFormValues,
} from "@/lib/validations/invoice";
import { fail, fromUnknown, ok, type ActionResult } from "./result";

function revalidateInvoices(id?: string) {
  revalidateTag("invoices", "max");
  revalidateTag("reports", "max");
  revalidatePath("/invoices");
  revalidatePath("/");
  revalidatePath("/reminders");
  revalidatePath("/reports");
  if (id) {
    revalidateTag(`invoice-${id}`, "max");
    revalidatePath(`/invoices/${id}`);
  }
}

export async function listInvoices(params?: {
  page?: number;
  pageSize?: number;
  status?: InvoiceStatus;
  customerId?: string;
  search?: string;
  overdueOnly?: boolean;
}): Promise<PagedResponse<InvoiceListItem>> {
  return apiFetch<PagedResponse<InvoiceListItem>>("/api/invoices", {
    searchParams: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      status: params?.status,
      customerId: params?.customerId,
      search: params?.search,
      overdueOnly: params?.overdueOnly,
    },
    next: { tags: ["invoices"], revalidate: 15 },
  });
}

export async function getInvoice(id: string): Promise<Invoice> {
  return apiFetch<Invoice>(`/api/invoices/${id}`, {
    next: { tags: [`invoice-${id}`, "invoices"], revalidate: 10 },
  });
}

export async function getInvoiceStats(): Promise<InvoiceStats> {
  return apiFetch<InvoiceStats>("/api/invoices/stats", {
    next: { tags: ["invoices", "reports"], revalidate: 30 },
  });
}

export async function getReminders(params?: {
  withinDays?: number;
  onlyOverdue?: boolean;
}): Promise<InvoiceReminder[]> {
  return apiFetch<InvoiceReminder[]>("/api/invoices/reminders", {
    searchParams: {
      withinDays: params?.withinDays ?? 7,
      onlyOverdue: params?.onlyOverdue ?? false,
    },
    next: { tags: ["invoices", "reminders"], revalidate: 15 },
  });
}

export async function createInvoiceAction(
  values: InvoiceFormValues,
  status?: InvoiceStatus,
): Promise<ActionResult<Invoice>> {
  const parsed = invoiceSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".") || "form"] ??= issue.message;
    }
    return fail("Skontroluj formulár", fieldErrors);
  }

  const body: CreateInvoiceInput = {
    ...parsed.data,
    status: status ?? "Draft",
  };

  try {
    const data = await apiFetch<Invoice>("/api/invoices", {
      method: "POST",
      body,
    });
    revalidateInvoices(data.id);
    return ok(data);
  } catch (error) {
    return fromUnknown(error);
  }
}

export async function updateInvoiceAction(
  id: string,
  values: InvoiceFormValues,
): Promise<ActionResult<Invoice>> {
  const parsed = invoiceSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".") || "form"] ??= issue.message;
    }
    return fail("Skontroluj formulár", fieldErrors);
  }

  if (!parsed.data.issueDate || !parsed.data.dueDate) {
    return fail("Dátum vystavenia a splatnosti sú povinné");
  }

  const body: UpdateInvoiceInput = {
    customerId: parsed.data.customerId,
    issueDate: parsed.data.issueDate,
    dueDate: parsed.data.dueDate,
    deliveryDate: parsed.data.deliveryDate,
    currency: parsed.data.currency,
    variableSymbol: parsed.data.variableSymbol,
    constantSymbol: parsed.data.constantSymbol,
    specificSymbol: parsed.data.specificSymbol,
    paymentMethod: parsed.data.paymentMethod,
    bankIban: parsed.data.bankIban,
    bankBic: parsed.data.bankBic,
    notes: parsed.data.notes,
    items: parsed.data.items,
  };

  try {
    const data = await apiFetch<Invoice>(`/api/invoices/${id}`, {
      method: "PUT",
      body,
    });
    revalidateInvoices(id);
    return ok(data);
  } catch (error) {
    return fromUnknown(error);
  }
}

export async function issueInvoiceAction(
  id: string,
): Promise<ActionResult<InvoiceStatusResponse>> {
  try {
    const data = await apiFetch<InvoiceStatusResponse>(
      `/api/invoices/${id}/status`,
      { method: "PATCH", body: { status: "Issued" } },
    );
    revalidateInvoices(id);
    return ok(data);
  } catch (error) {
    return fromUnknown(error);
  }
}

export async function markPaidAction(
  id: string,
  paidAt?: string | null,
): Promise<ActionResult<InvoiceStatusResponse>> {
  try {
    const data = await apiFetch<InvoiceStatusResponse>(
      `/api/invoices/${id}/pay`,
      { method: "POST", body: { paidAt: paidAt || null } },
    );
    revalidateInvoices(id);
    return ok(data);
  } catch (error) {
    return fromUnknown(error);
  }
}

export async function cancelInvoiceAction(
  id: string,
  reason: string,
): Promise<ActionResult<InvoiceStatusResponse>> {
  const parsed = cancelSchema.safeParse({ reason });
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Neplatný dôvod");
  }

  try {
    const data = await apiFetch<InvoiceStatusResponse>(
      `/api/invoices/${id}/cancel`,
      { method: "POST", body: parsed.data },
    );
    revalidateInvoices(id);
    return ok(data);
  } catch (error) {
    return fromUnknown(error);
  }
}

export async function deleteInvoiceAction(id: string): Promise<ActionResult> {
  try {
    await apiFetch<void>(`/api/invoices/${id}`, { method: "DELETE" });
    revalidateInvoices(id);
    return ok(undefined);
  } catch (error) {
    return fromUnknown(error);
  }
}

export async function duplicateInvoiceAction(
  id: string,
): Promise<ActionResult<Invoice>> {
  try {
    const data = await apiFetch<Invoice>(`/api/invoices/${id}/duplicate`, {
      method: "POST",
    });
    revalidateInvoices(data.id);
    return ok(data);
  } catch (error) {
    return fromUnknown(error);
  }
}

export async function markReminderSentAction(
  id: string,
): Promise<ActionResult> {
  try {
    await apiFetch(`/api/invoices/${id}/reminders/mark-sent`, {
      method: "POST",
    });
    revalidateTag("reminders", "max");
    revalidateInvoices(id);
    return ok(undefined);
  } catch (error) {
    return fromUnknown(error);
  }
}

export async function syncOverdueAction(): Promise<
  ActionResult<SyncOverdueResponse>
> {
  try {
    const data = await apiFetch<SyncOverdueResponse>(
      "/api/invoices/sync-overdue",
      { method: "POST" },
    );
    revalidateInvoices();
    return ok(data);
  } catch (error) {
    return fromUnknown(error);
  }
}
