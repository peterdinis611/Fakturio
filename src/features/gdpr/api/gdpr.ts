"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import { clearAccessToken } from "@/shared/auth/session";
import { ActionError, actionClient } from "@/shared/lib/safe-action";

const deleteSchema = z.object({
  password: z.string().min(1, "Heslo je povinné"),
  confirmation: z
    .string()
    .trim()
    .refine(
      (v) => v.toUpperCase() === "ZMAZAT" || v.toUpperCase() === "DELETE",
      "Napíš ZMAZAT alebo DELETE",
    ),
});

export const deleteAccountAction = actionClient
  .inputSchema(deleteSchema)
  .action(async ({ parsedInput }) => {
    try {
      await apiFetch<void>("/api/gdpr/delete-account", {
        method: "POST",
        body: parsedInput,
        cache: "no-store",
      });
      await clearAccessToken();
      revalidateTag("auth-user", "max");
      revalidateTag("company", "max");
      revalidatePath("/", "layout");
      return { ok: true as const };
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
