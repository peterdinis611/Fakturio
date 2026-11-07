"use server";

import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type { FxRates } from "@/shared/api/types";
import { ActionError, actionClient } from "@/shared/lib/safe-action";

const ratesSchema = z.object({
  base: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .optional()
    .default("EUR"),
  symbols: z.string().trim().optional(),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Neplatný dátum")
    .optional(),
});

export const getFxRatesAction = actionClient
  .inputSchema(ratesSchema)
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<FxRates>("/api/fx/rates", {
        searchParams: {
          base: parsedInput.base,
          symbols: parsedInput.symbols,
          date: parsedInput.date,
        },
        next: { revalidate: parsedInput.date ? 86_400 : 3600, tags: ["fx"] },
      });
    } catch (error) {
      if (isApiError(error)) {
        throw new ActionError(error.message || "Kurzy nie sú dostupné.");
      }
      throw new ActionError("Kurzy nie sú dostupné.");
    }
  });
