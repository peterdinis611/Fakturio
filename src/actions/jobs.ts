"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api/client";
import type { JobSettings } from "@/lib/api/types";
import { ActionError, actionClient } from "@/lib/safe-action";
import { isApiError } from "@/lib/api/errors";
import { jobSettingsSchema } from "@/lib/validations/jobs";

export async function getJobSettings(): Promise<JobSettings> {
  return apiFetch<JobSettings>("/api/jobs/settings", {
    cache: "no-store",
  });
}

export const updateJobSettingsAction = actionClient
  .inputSchema(jobSettingsSchema)
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<JobSettings>("/api/jobs/settings", {
        method: "PUT",
        body: parsedInput,
        cache: "no-store",
      });
      revalidatePath("/settings/jobs");
      return data;
    } catch (e) {
      if (isApiError(e)) throw new ActionError(e.message);
      throw e;
    }
  });
