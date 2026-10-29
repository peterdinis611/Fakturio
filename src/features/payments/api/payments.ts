"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type {
  PaymentImportConfirmResponse,
  PaymentImportPreviewResponse,
} from "@/shared/api/types";
import { ActionError, actionClient } from "@/shared/lib/safe-action";

export const previewPaymentImportAction = actionClient
  .inputSchema(z.object({ csvText: z.string().min(1, "CSV je povinné") }))
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<PaymentImportPreviewResponse>(
        "/api/payments/import/preview",
        {
          method: "POST",
          body: { csvText: parsedInput.csvText },
        },
      );
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const confirmPaymentImportAction = actionClient
  .inputSchema(
    z.object({
      rows: z
        .array(
          z.object({
            invoiceId: z.string().uuid(),
            paidAt: z.string().nullable().optional(),
          }),
        )
        .min(1)
        .max(500),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<PaymentImportConfirmResponse>(
        "/api/payments/import/confirm",
        {
          method: "POST",
          body: { rows: parsedInput.rows },
        },
      );
      revalidateTag("invoices", "max");
      revalidatePath("/invoices");
      revalidatePath("/payments/import");
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
