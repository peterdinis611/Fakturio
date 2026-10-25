"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { apiFetch } from "@/lib/api/client";
import type {
  CompanyCompleteness,
  CompanySettings,
  CompanySummary,
} from "@/lib/api/types";
import { companySchema, type CompanyFormValues } from "@/lib/validations/company";
import { fail, fromUnknown, ok, type ActionResult } from "./result";

export async function getCompany(): Promise<CompanySettings> {
  return apiFetch<CompanySettings>("/api/company", {
    next: { tags: ["company"], revalidate: 30 },
  });
}

export async function getCompanySummary(): Promise<CompanySummary> {
  return apiFetch<CompanySummary>("/api/company/summary", {
    next: { tags: ["company"], revalidate: 30 },
  });
}

export async function getCompanyStatus(): Promise<CompanyCompleteness> {
  return apiFetch<CompanyCompleteness>("/api/company/status", {
    next: { tags: ["company"], revalidate: 30 },
  });
}

export async function updateCompanyAction(
  values: CompanyFormValues,
): Promise<ActionResult<CompanySettings>> {
  const parsed = companySchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      fieldErrors[key] ??= issue.message;
    }
    return fail("Skontroluj formulár", fieldErrors);
  }

  try {
    const data = await apiFetch<CompanySettings>("/api/company", {
      method: "PUT",
      body: parsed.data,
    });
    revalidateTag("company", "max");
    revalidatePath("/", "layout");
    revalidatePath("/settings/company");
    revalidatePath("/onboarding");
    return ok(data);
  } catch (error) {
    return fromUnknown(error);
  }
}
