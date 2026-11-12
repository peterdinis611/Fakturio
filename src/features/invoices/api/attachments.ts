"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cache } from "react";
import { z } from "zod";
import { apiFetch, apiFetchFormData } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type { InvoiceAttachment } from "@/shared/api/types";
import { ActionError, actionClient } from "@/shared/lib/safe-action";

export const listInvoiceAttachments = cache(
  async (invoiceId: string): Promise<InvoiceAttachment[]> => {
    return apiFetch<InvoiceAttachment[]>(
      `/api/invoices/${invoiceId}/attachments`,
      {
        next: { tags: [`invoice-${invoiceId}`, "invoices"], revalidate: 10 },
      },
    );
  },
);

export async function uploadInvoiceAttachmentAction(
  invoiceId: string,
  formData: FormData,
): Promise<InvoiceAttachment> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new ActionError("Vyber súbor na nahratie.");
  }

  const body = new FormData();
  body.append("file", file, file.name);

  try {
    const data = await apiFetchFormData<InvoiceAttachment>(
      `/api/invoices/${invoiceId}/attachments`,
      body,
    );
    revalidateTag(`invoice-${invoiceId}`, "max");
    revalidateTag("invoices", "max");
    revalidatePath(`/invoices/${invoiceId}`);
    return data;
  } catch (error) {
    if (isApiError(error)) throw ActionError.fromApi(error);
    throw error;
  }
}

export const deleteInvoiceAttachmentAction = actionClient
  .inputSchema(
    z.object({
      id: z.string().uuid(),
      invoiceId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      await apiFetch<void>(`/api/attachments/${parsedInput.id}`, {
        method: "DELETE",
      });
      revalidateTag(`invoice-${parsedInput.invoiceId}`, "max");
      revalidateTag("invoices", "max");
      revalidatePath(`/invoices/${parsedInput.invoiceId}`);
      return { ok: true as const };
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
