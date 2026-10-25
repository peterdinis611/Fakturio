"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { apiFetch } from "@/lib/api/client";
import type { Customer, CreateCustomerInput, PagedResponse } from "@/lib/api/types";
import { customerSchema, type CustomerFormValues } from "@/lib/validations/customer";
import { fail, fromUnknown, ok, type ActionResult } from "./result";

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
    next: { tags: ["customers"], revalidate: 20 },
  });
}

export async function getCustomer(id: string): Promise<Customer> {
  return apiFetch<Customer>(`/api/customers/${id}`, {
    next: { tags: [`customer-${id}`, "customers"], revalidate: 20 },
  });
}

export async function createCustomerAction(
  values: CustomerFormValues,
): Promise<ActionResult<Customer>> {
  const parsed = customerSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".") || "form"] ??= issue.message;
    }
    return fail("Skontroluj formulár", fieldErrors);
  }

  try {
    const data = await apiFetch<Customer>("/api/customers", {
      method: "POST",
      body: parsed.data as CreateCustomerInput,
    });
    revalidateTag("customers", "max");
    revalidatePath("/customers");
    return ok(data);
  } catch (error) {
    return fromUnknown(error);
  }
}

export async function updateCustomerAction(
  id: string,
  values: CustomerFormValues,
): Promise<ActionResult<Customer>> {
  const parsed = customerSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".") || "form"] ??= issue.message;
    }
    return fail("Skontroluj formulár", fieldErrors);
  }

  try {
    const data = await apiFetch<Customer>(`/api/customers/${id}`, {
      method: "PUT",
      body: parsed.data,
    });
    revalidateTag("customers", "max");
    revalidateTag(`customer-${id}`, "max");
    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    return ok(data);
  } catch (error) {
    return fromUnknown(error);
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  try {
    await apiFetch<void>(`/api/customers/${id}`, { method: "DELETE" });
    revalidateTag("customers", "max");
    revalidatePath("/customers");
    return ok(undefined);
  } catch (error) {
    return fromUnknown(error);
  }
}
