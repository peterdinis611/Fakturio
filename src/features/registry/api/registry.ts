"use server";

import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type { RegistryCompany } from "@/shared/api/types";
import { ActionError, actionClient } from "@/shared/lib/safe-action";
import { isValidIco } from "@/shared/lib/validations/sk";

const lookupSchema = z.object({
  country: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => v === "SK" || v === "CZ", {
      message: "Lookup je dostupný pre SK a CZ",
    }),
  ico: z
    .string()
    .trim()
    .refine((v) => isValidIco(v), {
      message: "Neplatné IČO (8 číslic + kontrolná cifra)",
    }),
});

export const lookupRegistryAction = actionClient
  .inputSchema(lookupSchema)
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<RegistryCompany>(
        `/api/registry/${parsedInput.country}/${parsedInput.ico}`,
        { cache: "no-store" },
      );
    } catch (error) {
      if (isApiError(error)) {
        if (error.status === 404 || error.problem.code === "registry_not_found") {
          throw new ActionError("Firma s týmto IČO sa v registri nenašla.");
        }
        if (
          error.status === 502 ||
          error.problem.code === "registry_unavailable"
        ) {
          throw new ActionError("Register je dočasne nedostupný. Skús neskôr.");
        }
        if (error.problem.code === "invalid_ico") {
          throw new ActionError("Neplatné IČO (8 číslic + kontrolná cifra).");
        }
        throw new ActionError(error.message);
      }
      throw error;
    }
  });
