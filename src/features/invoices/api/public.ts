"use server";

import { cache } from "react";
import { apiFetch } from "@/shared/api/client";
import type { PublicInvoice, PublicLink } from "@/shared/api/types";
import { ActionError, actionClient } from "@/shared/lib/safe-action";
import { isApiError } from "@/shared/api/errors";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export const getPublicInvoice = cache(
  async (token: string): Promise<PublicInvoice> => {
    return apiFetch<PublicInvoice>(`/api/public/invoices/${encodeURIComponent(token)}`, {
      skipAuth: true,
      cache: "no-store",
    });
  },
);

export async function getInvoicePublicLink(id: string): Promise<PublicLink> {
  return apiFetch<PublicLink>(`/api/invoices/${id}/public-link`, {
    next: { tags: [`invoice-${id}`], revalidate: 10 },
  });
}

export const setInvoicePublicLinkAction = actionClient
  .inputSchema(
    z.object({
      id: z.string().uuid(),
      enabled: z.boolean(),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<PublicLink>(
        `/api/invoices/${parsedInput.id}/public-link`,
        {
          method: "PUT",
          body: { enabled: parsedInput.enabled },
        },
      );
      revalidatePath(`/invoices/${parsedInput.id}`);
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
