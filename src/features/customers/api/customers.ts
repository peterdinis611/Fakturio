"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type { Customer, CreateCustomerInput, PagedResponse } from "@/shared/api/types";
import { ActionError, actionClient } from "@/shared/lib/safe-action";
import { customerSchema } from "@/entities/customer/model/schema";

export async function listCustomers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PagedResponse<Customer>> {
  return apiFetch<PagedResponse<Customer>>("/api/customers", {
    searchParams: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      search: params?.search,
    },
    next: { tags: ["customers"], revalidate: 30 },
  });
}

export async function getCustomer(id: string): Promise<Customer> {
  return apiFetch<Customer>(`/api/customers/${id}`, {
    next: { tags: [`customer-${id}`, "customers"], revalidate: 20 },
  });
}

function mapApiFieldErrors(
  schema: typeof customerSchema,
  error: unknown,
): never | void {
  if (!isApiError(error)) return;
  const fields = error.fieldErrors();
  if (Object.keys(fields).length === 0) throw error;

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

export const createCustomerAction = actionClient
  .inputSchema(customerSchema)
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<Customer>("/api/customers", {
        method: "POST",
        body: parsedInput as CreateCustomerInput,
      });
      revalidateTag("customers", "max");
      revalidatePath("/customers");
      return data;
    } catch (error) {
      mapApiFieldErrors(customerSchema, error);
      throw error instanceof Error
        ? error
        : new ActionError("Zákazníka sa nepodarilo vytvoriť");
    }
  });

const updateCustomerSchema = customerSchema.and(
  z.object({ id: z.string().uuid("Neplatné ID zákazníka") }),
);

export const updateCustomerAction = actionClient
  .inputSchema(updateCustomerSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...values } = parsedInput;
    try {
      const data = await apiFetch<Customer>(`/api/customers/${id}`, {
        method: "PUT",
        body: values,
      });
      revalidateTag("customers", "max");
      revalidateTag(`customer-${id}`, "max");
      revalidatePath("/customers");
      revalidatePath(`/customers/${id}`);
      return data;
    } catch (error) {
      mapApiFieldErrors(customerSchema, error);
      throw error instanceof Error
        ? error
        : new ActionError("Zákazníka sa nepodarilo uložiť");
    }
  });

export const deleteCustomerAction = actionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: { id } }) => {
    try {
      await apiFetch<void>(`/api/customers/${id}`, { method: "DELETE" });
      revalidateTag("customers", "max");
      revalidatePath("/customers");
      return { id };
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
