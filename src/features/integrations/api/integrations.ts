"use server";

import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type {
  AddressNormalize,
  FsVatPayer,
  IbanLookup,
  OrsrCompanySummary,
} from "@/shared/api/types";
import { ActionError, actionClient } from "@/shared/lib/safe-action";
import { isValidIco, normalizeIco } from "@/shared/lib/validations/sk";

export const lookupIbanAction = actionClient
  .inputSchema(
    z.object({
      iban: z
        .string()
        .trim()
        .min(15, "Zadaj IBAN")
        .transform((v) => v.replace(/\s+/g, "").toUpperCase()),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<IbanLookup>("/api/integrations/iban", {
        searchParams: { iban: parsedInput.iban },
        cache: "no-store",
      });
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message || "IBAN lookup zlyhal.");
      throw new ActionError("IBAN lookup zlyhal.");
    }
  });

export const lookupFsVatAction = actionClient
  .inputSchema(
    z.object({
      ico: z
        .string()
        .transform((v) => normalizeIco(v))
        .refine((v) => isValidIco(v), { message: "Neplatné IČO" }),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<FsVatPayer>(
        `/api/integrations/fs-vat/${parsedInput.ico}`,
        { cache: "no-store" },
      );
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message || "FS DPH lookup zlyhal.");
      throw new ActionError("FS DPH lookup zlyhal.");
    }
  });

export const normalizeAddressAction = actionClient
  .inputSchema(
    z.object({
      q: z.string().trim().min(3, "Zadaj aspoň 3 znaky"),
      country: z.string().trim().optional().default("SK"),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<AddressNormalize>("/api/integrations/address", {
        searchParams: { q: parsedInput.q, country: parsedInput.country },
        cache: "no-store",
      });
    } catch (error) {
      if (isApiError(error)) {
        throw new ActionError(error.message || "Normalizácia adresy zlyhala.");
      }
      throw new ActionError("Normalizácia adresy zlyhala.");
    }
  });

export const lookupOrsrAction = actionClient
  .inputSchema(
    z.object({
      ico: z
        .string()
        .transform((v) => normalizeIco(v))
        .refine((v) => isValidIco(v), { message: "Neplatné IČO" }),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<OrsrCompanySummary>(
        `/api/integrations/orsr/${parsedInput.ico}`,
        { cache: "no-store" },
      );
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message || "ORSR lookup zlyhal.");
      throw new ActionError("ORSR lookup zlyhal.");
    }
  });
