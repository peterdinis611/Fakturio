"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import { ActionError, actionClient } from "@/shared/lib/safe-action";
import type {
  EmailStatus,
  SendInvoiceEmailResponse,
  SendTestEmailResponse,
} from "@/features/emails/model/types";

export async function getEmailStatus(): Promise<EmailStatus> {
  return apiFetch<EmailStatus>("/api/emails/status", {
    next: { tags: ["email-status"], revalidate: 60 },
  });
}

export const sendTestEmailAction = actionClient
  .inputSchema(
    z.object({
      to: z.string().email().optional().or(z.literal("")),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<SendTestEmailResponse>("/api/emails/test", {
        method: "POST",
        body: { to: parsedInput.to || null },
      });
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

const sendInvoiceSchema = z.object({
  id: z.string().uuid(),
  to: z.string().email().optional().or(z.literal("")),
  subject: z.string().max(200).optional().or(z.literal("")),
  message: z.string().max(4000).optional().or(z.literal("")),
  attachPdf: z.boolean().optional(),
  includePublicLink: z.boolean().optional(),
});

export const sendInvoiceEmailAction = actionClient
  .inputSchema(sendInvoiceSchema)
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<SendInvoiceEmailResponse>(
        `/api/invoices/${parsedInput.id}/email`,
        {
          method: "POST",
          body: {
            to: parsedInput.to || null,
            subject: parsedInput.subject || null,
            message: parsedInput.message || null,
            attachPdf: parsedInput.attachPdf ?? true,
            includePublicLink: parsedInput.includePublicLink ?? true,
          },
        },
      );
      revalidateTag(`invoice-${parsedInput.id}`, "max");
      revalidateTag("audit-logs", "max");
      revalidatePath(`/invoices/${parsedInput.id}`);
      revalidatePath("/logs");
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
