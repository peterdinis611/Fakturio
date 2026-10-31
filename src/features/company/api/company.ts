"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { cache } from "react";
import { apiFetch, apiFetchFormData } from "@/shared/api/client";
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

const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
]);

export { LOGO_MAX_BYTES, LOGO_TYPES };

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

export async function uploadCompanyLogoAction(
  formData: FormData,
): Promise<CompanySettings> {
  "use server";
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new ActionError("Vyber súbor s logom.");
  }
  if (file.size > LOGO_MAX_BYTES) {
    throw new ActionError("Logo môže mať najviac 2 MB.");
  }
  if (file.type && !LOGO_TYPES.has(file.type)) {
    throw new ActionError("Povolené formáty: PNG, JPEG, WebP, SVG.");
  }

  const body = new FormData();
  body.append("file", file, file.name);

  try {
    const data = await apiFetchFormData<CompanySettings>(
      "/api/company/logo",
      body,
    );
    revalidateTag("company", "max");
    revalidatePath("/", "layout");
    revalidatePath("/profile");
    revalidatePath("/settings/company");
    return data;
  } catch (error) {
    if (isApiError(error)) throw new ActionError(error.message);
    throw error;
  }
}

export async function deleteCompanyLogoAction(): Promise<CompanySettings> {
  "use server";
  try {
    const data = await apiFetch<CompanySettings>("/api/company/logo", {
      method: "DELETE",
    });
    revalidateTag("company", "max");
    revalidatePath("/", "layout");
    revalidatePath("/profile");
    revalidatePath("/settings/company");
    return data;
  } catch (error) {
    if (isApiError(error)) throw new ActionError(error.message);
    throw error;
  }
}
