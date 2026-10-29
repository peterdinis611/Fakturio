"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type {
  CompanyCompleteness,
  CompanySettings,
  CompanySummary,
} from "@/shared/api/types";
import {
  clearOnboardingSkipped,
  setOnboardingSkipped,
} from "@/shared/lib/onboarding";
import { ActionError, actionClient } from "@/shared/lib/safe-action";
import { companySchema } from "@/entities/company/model/schema";

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

export const updateCompanyAction = actionClient
  .inputSchema(companySchema)
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<CompanySettings>("/api/company", {
        method: "PUT",
        body: parsedInput,
      });
      if (parsedInput.name.trim()) {
        await clearOnboardingSkipped();
      }
      revalidateTag("company", "max");
      revalidatePath("/", "layout");
      revalidatePath("/settings/company");
      revalidatePath("/onboarding");
      return data;
    } catch (error) {
      if (isApiError(error)) {
        const fields = error.fieldErrors();
        if (Object.keys(fields).length > 0) {
          returnValidationErrors(
            companySchema,
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
      throw error;
    }
  });

/** Soft-skip: allow app access and finish company setup later. */
export async function skipOnboardingAction(): Promise<void> {
  await setOnboardingSkipped();
  revalidatePath("/", "layout");
  revalidatePath("/onboarding");
}
