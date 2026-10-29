"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceDocumentType,
  InvoiceListItem,
  InvoiceReminder,
  InvoiceStats,
  InvoiceStatus,
  InvoiceStatusResponse,
  PagedResponse,
  SyncOverdueResponse,
  UpdateInvoiceInput,
} from "@/shared/api/types";
import { ActionError, actionClient } from "@/shared/lib/safe-action";
import {
  cancelSchema,
  invoiceSchema,
  markPaidSchema,
} from "@/entities/invoice/model/schema";

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
  documentType?: InvoiceDocumentType;
  customerId?: string;
  search?: string;
  overdueOnly?: boolean;
}): Promise<PagedResponse<InvoiceListItem>> {
  return apiFetch<PagedResponse<InvoiceListItem>>("/api/invoices", {
    searchParams: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      status: params?.status,
      documentType: params?.documentType,
      customerId: params?.customerId,
      search: params?.search,
      overdueOnly: params?.overdueOnly,
    },
    next: { tags: ["invoices"], revalidate: 30 },
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

const createInvoiceSchema = invoiceSchema.and(
  z.object({
    status: z.enum(["Draft", "Issued"]).optional().default("Draft"),
    documentType: z.enum(["Invoice", "Proforma"]).optional().default("Invoice"),
  }),
);

const updateInvoiceSchema = invoiceSchema.and(
  z.object({ id: z.string().uuid("Neplatné ID faktúry") }),
);

const invoiceIdSchema = z.object({ id: z.string().uuid("Neplatné ID faktúry") });

function throwMappedApiError(schema: z.ZodType, error: unknown): never {
  if (isApiError(error)) {
    const fields = error.fieldErrors();
    if (Object.keys(fields).length > 0) {
      returnValidationErrors(
        schema,
        Object.fromEntries(
          Object.entries(fields).map(([key, message]) => [
            key,
            { _errors: [message] },
          ]),
        ) as never,
      );
    }
    throw new ActionError(error.message);
  }
  throw error instanceof Error
    ? error
    : new ActionError("Operácia zlyhala");
}

export const createInvoiceAction = actionClient
  .inputSchema(createInvoiceSchema)
  .action(async ({ parsedInput }) => {
    const { status, documentType, ...values } = parsedInput;
    const body: CreateInvoiceInput = {
      ...values,
      status: status ?? "Draft",
      documentType: documentType ?? "Invoice",
    };

    try {
      const data = await apiFetch<Invoice>("/api/invoices", {
        method: "POST",
        body,
      });
      revalidateInvoices(data.id);
      return data;
    } catch (error) {
      throwMappedApiError(invoiceSchema, error);
    }
  });

export const updateInvoiceAction = actionClient
  .inputSchema(updateInvoiceSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...values } = parsedInput;

    if (!values.issueDate || !values.dueDate) {
      throw new ActionError("Dátum vystavenia a splatnosti sú povinné");
    }

    const body: UpdateInvoiceInput = {
      customerId: values.customerId,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      deliveryDate: values.deliveryDate,
      currency: values.currency,
      variableSymbol: values.variableSymbol,
      constantSymbol: values.constantSymbol,
      specificSymbol: values.specificSymbol,
      paymentMethod: values.paymentMethod,
      bankIban: values.bankIban,
      bankBic: values.bankBic,
      notes: values.notes,
      items: values.items,
    };

    try {
      const data = await apiFetch<Invoice>(`/api/invoices/${id}`, {
        method: "PUT",
        body,
      });
      revalidateInvoices(id);
      return data;
    } catch (error) {
      throwMappedApiError(invoiceSchema, error);
    }
  });

export const issueInvoiceAction = actionClient
  .inputSchema(invoiceIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      const data = await apiFetch<InvoiceStatusResponse>(
        `/api/invoices/${id}/status`,
        { method: "PATCH", body: { status: "Issued" } },
      );
      revalidateInvoices(id);
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const markPaidAction = actionClient
  .inputSchema(
    invoiceIdSchema.and(markPaidSchema),
  )
  .action(async ({ parsedInput: { id, paidAt } }) => {
    try {
      const data = await apiFetch<InvoiceStatusResponse>(
        `/api/invoices/${id}/pay`,
        { method: "POST", body: { paidAt: paidAt || null } },
      );
      revalidateInvoices(id);
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const cancelInvoiceAction = actionClient
  .inputSchema(
    invoiceIdSchema.and(cancelSchema),
  )
  .action(async ({ parsedInput: { id, reason } }) => {
    try {
      const data = await apiFetch<InvoiceStatusResponse>(
        `/api/invoices/${id}/cancel`,
        { method: "POST", body: { reason } },
      );
      revalidateInvoices(id);
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const deleteInvoiceAction = actionClient
  .inputSchema(invoiceIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      await apiFetch<void>(`/api/invoices/${id}`, { method: "DELETE" });
      revalidateInvoices(id);
      return { id };
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const duplicateInvoiceAction = actionClient
  .inputSchema(invoiceIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      const data = await apiFetch<Invoice>(`/api/invoices/${id}/duplicate`, {
        method: "POST",
      });
      revalidateInvoices(data.id);
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const markReminderSentAction = actionClient
  .inputSchema(invoiceIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      await apiFetch(`/api/invoices/${id}/reminders/mark-sent`, {
        method: "POST",
      });
      revalidateTag("reminders", "max");
      revalidateInvoices(id);
      return { id };
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const syncOverdueAction = actionClient.action(async () => {
  try {
    const data = await apiFetch<SyncOverdueResponse>(
      "/api/invoices/sync-overdue",
      { method: "POST" },
    );
    revalidateInvoices();
    return data;
  } catch (error) {
    if (isApiError(error)) throw new ActionError(error.message);
    throw error;
  }
});

export const createCreditNoteAction = actionClient
  .inputSchema(invoiceIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      const data = await apiFetch<Invoice>(`/api/invoices/${id}/credit-note`, {
        method: "POST",
        body: {},
      });
      revalidateInvoices(id);
      revalidateInvoices(data.id);
      revalidateTag("audit-logs", "max");
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const finalizeProformaAction = actionClient
  .inputSchema(invoiceIdSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      const data = await apiFetch<Invoice>(
        `/api/invoices/${id}/finalize-proforma`,
        { method: "POST", body: {} },
      );
      revalidateInvoices(id);
      revalidateInvoices(data.id);
      revalidateTag("audit-logs", "max");
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
