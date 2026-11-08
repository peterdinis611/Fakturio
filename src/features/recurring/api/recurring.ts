"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type { Invoice, PagedResponse } from "@/shared/api/types";
import { ActionError, actionClient } from "@/shared/lib/safe-action";
import {
  recurringSchema,
  type RecurringInvoice,
  type RecurringListItem,
} from "@/features/recurring/model/types";

export async function listRecurring(params?: {
  page?: number;
  pageSize?: number;
  activeOnly?: boolean;
}): Promise<PagedResponse<RecurringListItem>> {
  return apiFetch<PagedResponse<RecurringListItem>>("/api/recurring-invoices", {
    searchParams: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
      activeOnly: params?.activeOnly,
    },
    next: { tags: ["recurring"], revalidate: 20 },
  });
}

export async function getRecurring(id: string): Promise<RecurringInvoice> {
  return apiFetch<RecurringInvoice>(`/api/recurring-invoices/${id}`, {
    next: { tags: [`recurring-${id}`, "recurring"], revalidate: 15 },
  });
}

function revalidateRecurring(id?: string) {
  revalidateTag("recurring", "max");
  revalidateTag("invoices", "max");
  revalidateTag("audit-logs", "max");
  revalidatePath("/recurring");
  revalidatePath("/services");
  revalidatePath("/invoices");
  revalidatePath("/logs");
  if (id) {
    revalidateTag(`recurring-${id}`, "max");
  }
}

export const createRecurringAction = actionClient
  .inputSchema(recurringSchema)
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<RecurringInvoice>("/api/recurring-invoices", {
        method: "POST",
        body: parsedInput,
      });
      revalidateRecurring(data.id);
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const updateRecurringAction = actionClient
  .inputSchema(recurringSchema.and(z.object({ id: z.string().uuid() })))
  .action(async ({ parsedInput }) => {
    const { id, ...body } = parsedInput;
    try {
      const data = await apiFetch<RecurringInvoice>(
        `/api/recurring-invoices/${id}`,
        { method: "PUT", body },
      );
      revalidateRecurring(id);
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const deleteRecurringAction = actionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    try {
      await apiFetch<void>(`/api/recurring-invoices/${parsedInput.id}`, {
        method: "DELETE",
      });
      revalidateRecurring(parsedInput.id);
      return { ok: true as const };
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const generateRecurringAction = actionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<Invoice>(
        `/api/recurring-invoices/${parsedInput.id}/generate`,
        { method: "POST" },
      );
      revalidateRecurring(parsedInput.id);
      revalidateTag("invoices", "max");
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
