"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { cache } from "react";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type {
  CompanyBank,
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

export const getCompany = cache(async (): Promise<CompanySettings> => {
  return apiFetch<CompanySettings>("/api/company", {
    next: { tags: ["company"], revalidate: 60 },
  });
});

export const getCompanySummary = cache(async (): Promise<CompanySummary> => {
  return apiFetch<CompanySummary>("/api/company/summary", {
    next: { tags: ["company"], revalidate: 60 },
  });
});

export const getCompanyStatus = cache(async (): Promise<CompanyCompleteness> => {
  return apiFetch<CompanyCompleteness>("/api/company/status", {
    next: { tags: ["company"], revalidate: 60 },
  });
});

export const getCompanyBank = cache(async (): Promise<CompanyBank> => {
  return apiFetch<CompanyBank>("/api/company/bank", {
    next: { tags: ["company"], revalidate: 60 },
  });
});

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
