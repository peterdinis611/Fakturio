"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { isApiError } from "@/lib/api/errors";
import type { PagedResponse, ServiceCatalogItem } from "@/lib/api/types";
import { ActionError, actionClient } from "@/lib/safe-action";
import { serviceCatalogSchema } from "@/lib/validations/service-catalog";

export async function listServices(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  activeOnly?: boolean;
}): Promise<PagedResponse<ServiceCatalogItem>> {
  return apiFetch<PagedResponse<ServiceCatalogItem>>("/api/services", {
    searchParams: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
      search: params?.search,
      activeOnly: params?.activeOnly,
    },
    next: { tags: ["services"], revalidate: 20 },
  });
}

function mapApiFieldErrors(error: unknown): never | void {
  if (!isApiError(error)) return;
  const fields = error.fieldErrors();
  if (Object.keys(fields).length === 0) throw error;

  returnValidationErrors(
    serviceCatalogSchema,
    Object.fromEntries(
      Object.entries(fields).map(([key, message]) => [
        key,
        { _errors: [message] },
      ]),
    ) as never,
  );
}

export const createServiceAction = actionClient
  .inputSchema(serviceCatalogSchema)
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<ServiceCatalogItem>("/api/services", {
        method: "POST",
        body: parsedInput,
      });
      revalidateTag("services", "max");
      revalidatePath("/services");
      return data;
    } catch (error) {
      mapApiFieldErrors(error);
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const updateServiceAction = actionClient
  .inputSchema(
    serviceCatalogSchema.extend({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { id, ...body } = parsedInput;
    try {
      const data = await apiFetch<ServiceCatalogItem>(`/api/services/${id}`, {
        method: "PUT",
        body,
      });
      revalidateTag("services", "max");
      revalidatePath("/services");
      return data;
    } catch (error) {
      mapApiFieldErrors(error);
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const deleteServiceAction = actionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    try {
      await apiFetch<void>(`/api/services/${parsedInput.id}`, {
        method: "DELETE",
      });
      revalidateTag("services", "max");
      revalidatePath("/services");
      return { ok: true };
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
