"use server";

import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type {
  AddressNormalize,
  AdisregStatus,
  AresVrSummary,
  BusinessDay,
  FsVatPayer,
  IbanLookup,
  IsirStatus,
  LeiLookup,
  OrsrCompanySummary,
  PostalValidate,
  RegisterUzStatements,
  RegisterUzUnit,
  RegistrSmluvStatus,
  RpvsStatus,
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

export const lookupAdisregAction = actionClient
  .inputSchema(
    z.object({
      dic: z
        .string()
        .trim()
        .min(8, "Zadaj DIČ")
        .transform((v) => v.replace(/^CZ/i, "").replace(/\D/g, ""))
        .refine((v) => /^\d{8,10}$/.test(v), { message: "Neplatné DIČ (8–10 číslic)" }),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<AdisregStatus>(
        `/api/integrations/adisreg/${parsedInput.dic}`,
        { cache: "no-store" },
      );
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message || "ADISREG lookup zlyhal.");
      throw new ActionError("ADISREG lookup zlyhal.");
    }
  });

export const lookupIsirAction = actionClient
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
      return await apiFetch<IsirStatus>("/api/integrations/isir", {
        searchParams: { ico: parsedInput.ico },
        cache: "no-store",
      });
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message || "ISIR lookup zlyhal.");
      throw new ActionError("ISIR lookup zlyhal.");
    }
  });

export const lookupRegisterUzAction = actionClient
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
      return await apiFetch<RegisterUzUnit>("/api/integrations/register-uz", {
        searchParams: { ico: parsedInput.ico },
        cache: "no-store",
      });
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message || "RegisterUZ lookup zlyhal.");
      throw new ActionError("RegisterUZ lookup zlyhal.");
    }
  });

export const validatePostalAction = actionClient
  .inputSchema(
    z.object({
      code: z
        .string()
        .trim()
        .min(5, "Zadaj PSČ")
        .transform((v) => v.replace(/\D/g, ""))
        .refine((v) => /^\d{5}$/.test(v), { message: "PSČ musí mať 5 číslic" }),
      country: z.string().trim().optional().default("SK"),
      city: z.string().trim().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<PostalValidate>("/api/integrations/postal", {
        searchParams: {
          code: parsedInput.code,
          country: parsedInput.country,
          ...(parsedInput.city ? { city: parsedInput.city } : {}),
        },
        cache: "no-store",
      });
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message || "PSČ validácia zlyhala.");
      throw new ActionError("PSČ validácia zlyhala.");
    }
  });

export const lookupAresVrAction = actionClient
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
      return await apiFetch<AresVrSummary>(
        `/api/integrations/ares-vr/${parsedInput.ico}`,
        { cache: "no-store" },
      );
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message || "ARES VR lookup zlyhal.");
      throw new ActionError("ARES VR lookup zlyhal.");
    }
  });

export const lookupRegisterUzStatementsAction = actionClient
  .inputSchema(
    z.object({
      ico: z
        .string()
        .transform((v) => normalizeIco(v))
        .refine((v) => isValidIco(v), { message: "Neplatné IČO" }),
      take: z.number().int().min(1).max(10).optional().default(5),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<RegisterUzStatements>(
        "/api/integrations/register-uz/statements",
        {
          searchParams: {
            ico: parsedInput.ico,
            take: String(parsedInput.take),
          },
          cache: "no-store",
        },
      );
    } catch (error) {
      if (isApiError(error)) {
        throw new ActionError(error.message || "RegisterUZ závierky zlyhali.");
      }
      throw new ActionError("RegisterUZ závierky zlyhali.");
    }
  });

export const businessDayAction = actionClient
  .inputSchema(
    z.object({
      from: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Neplatný dátum"),
      addDays: z.number().int().min(0).max(365).optional().default(0),
      country: z.string().trim().optional().default("SK"),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<BusinessDay>("/api/integrations/business-day", {
        searchParams: {
          from: parsedInput.from,
          addDays: String(parsedInput.addDays),
          country: parsedInput.country,
        },
        cache: "no-store",
      });
    } catch (error) {
      if (isApiError(error)) {
        throw new ActionError(error.message || "Výpočet pracovného dňa zlyhal.");
      }
      throw new ActionError("Výpočet pracovného dňa zlyhal.");
    }
  });

export const lookupRpvsAction = actionClient
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
      return await apiFetch<RpvsStatus>("/api/integrations/rpvs", {
        searchParams: { ico: parsedInput.ico },
        cache: "no-store",
      });
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message || "RPVS lookup zlyhal.");
      throw new ActionError("RPVS lookup zlyhal.");
    }
  });

export const lookupRegistrSmluvAction = actionClient
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
      return await apiFetch<RegistrSmluvStatus>("/api/integrations/registr-smluv", {
        searchParams: { ico: parsedInput.ico },
        cache: "no-store",
      });
    } catch (error) {
      if (isApiError(error)) {
        throw new ActionError(error.message || "Registr smluv lookup zlyhal.");
      }
      throw new ActionError("Registr smluv lookup zlyhal.");
    }
  });

export const lookupLeiAction = actionClient
  .inputSchema(
    z.object({
      ico: z
        .string()
        .transform((v) => normalizeIco(v))
        .refine((v) => isValidIco(v), { message: "Neplatné IČO" }),
      jurisdiction: z.string().trim().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      return await apiFetch<LeiLookup>("/api/integrations/lei", {
        searchParams: {
          ico: parsedInput.ico,
          ...(parsedInput.jurisdiction
            ? { jurisdiction: parsedInput.jurisdiction.toUpperCase() }
            : {}),
        },
        cache: "no-store",
      });
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message || "LEI lookup zlyhal.");
      throw new ActionError("LEI lookup zlyhal.");
    }
  });
