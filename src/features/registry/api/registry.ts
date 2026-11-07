"use server";

import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type {
  RegistryCompany,
  RegistrySearchResponse,
  VatVerification,
} from "@/shared/api/types";
import { ActionError, actionClient } from "@/shared/lib/safe-action";
import { isValidIco, normalizeIco } from "@/shared/lib/validations/sk";

const lookupSchema = z.object({
  country: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => v === "SK" || v === "CZ", {
      message: "Doplnenie z registra je dostupné pre SK a CZ",
    }),
  ico: z
    .string()
    .transform((v) => normalizeIco(v))
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
        throw new ActionError(
          error.message || "Doplnenie z registra zlyhalo.",
        );
      }
      throw new ActionError("Doplnenie z registra zlyhalo.");
    }
  });

const searchSchema = z.object({
  q: z.string().trim().min(2, "Zadaj aspoň 2 znaky"),
  country: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .optional()
    .default("SK"),
  limit: z.number().int().min(1).max(50).optional().default(8),
});

export const searchRegistryAction = actionClient
  .inputSchema(searchSchema)
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<RegistrySearchResponse>("/api/registry/search", {
        searchParams: {
          q: parsedInput.q,
          country: parsedInput.country,
          limit: parsedInput.limit,
        },
        cache: "no-store",
      });
    } catch (error) {
      if (isApiError(error)) {
        throw new ActionError(
          error.message || "Vyhľadávanie firiem zlyhalo.",
        );
      }
      throw new ActionError("Vyhľadávanie firiem zlyhalo.");
    }
  });

const viesSchema = z.object({
  vat: z
    .string()
    .trim()
    .min(4, "Zadaj IČ DPH")
    .transform((v) => v.replace(/[\s.-]/g, "").toUpperCase()),
});

export const verifyVatAction = actionClient
  .inputSchema(viesSchema)
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<VatVerification>("/api/registry/vies", {
        searchParams: { vat: parsedInput.vat },
        cache: "no-store",
      });
    } catch (error) {
      if (isApiError(error)) {
        if (error.problem.code === "invalid_vat_id") {
          throw new ActionError("Neplatný formát IČ DPH (napr. SK2121585004).");
        }
        if (error.problem.code === "vies_unavailable" || error.status === 502) {
          throw new ActionError("VIES je dočasne nedostupný. Skús neskôr.");
        }
        throw new ActionError(error.message || "Overenie DPH zlyhalo.");
      }
      throw new ActionError("Overenie DPH zlyhalo.");
    }
  });
