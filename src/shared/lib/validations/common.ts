import { z } from "zod";
import {
  isAllowedVatRate,
  isValidBic,
  isValidCountryCode,
  isValidCurrency,
  isValidDic,
  isValidEmail,
  isValidIban,
  isValidIcDph,
  isValidIco,
  isValidPostalCode,
  isValidVariableSymbol,
} from "@/shared/lib/validations/sk";

/** Empty string / null / undefined → null for optional API fields. */
export const optionalString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null) return null;
    const trimmed = v.trim();
    return trimmed === "" ? null : trimmed;
  });

export const optionalIco = optionalString.refine(
  (v) => v === null || isValidIco(v),
  { message: "Neplatné IČO (8 číslic + kontrolná cifra)" },
);

export const optionalDic = optionalString.refine(
  (v) => v === null || isValidDic(v),
  { message: "DIČ musí mať 10 číslic" },
);

export const optionalIcDph = optionalString.refine(
  (v) => v === null || isValidIcDph(v),
  { message: "IČ DPH musí byť v tvare SK + 10 číslic" },
);

export const optionalEmail = optionalString.refine(
  (v) => v === null || isValidEmail(v),
  { message: "Neplatný e-mail" },
);

export const optionalIban = optionalString.refine(
  (v) => v === null || isValidIban(v),
  { message: "Neplatný IBAN" },
);

export const optionalBic = optionalString.refine(
  (v) => v === null || isValidBic(v),
  { message: "Neplatný BIC / SWIFT" },
);

export const optionalPostalCode = optionalString.refine(
  (v) => v === null || isValidPostalCode(v),
  { message: "PSČ v tvare 123 45" },
);

export const optionalVariableSymbol = optionalString.refine(
  (v) => v === null || isValidVariableSymbol(v),
  { message: "VS: max. 10 číslic" },
);

export const countryCode = z
  .string()
  .trim()
  .min(2, "Krajina je povinná")
  .refine(isValidCountryCode, { message: "Kód krajiny (napr. SK)" })
  .transform((v) => v.toUpperCase());

export const currencyCode = z
  .string()
  .trim()
  .min(3)
  .max(3)
  .refine(isValidCurrency, { message: "Mena (napr. EUR)" })
  .transform((v) => v.toUpperCase());

export const vatRateSchema = z.coerce
  .number()
  .min(0)
  .max(100)
  .refine(isAllowedVatRate, {
    message: "Povolené sadzby DPH: 0, 5, 19, 23",
  });

export const optionalVatRate = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : v),
  z.coerce.number().min(0).max(100).nullable().optional().refine(
    (v) => v == null || isAllowedVatRate(v),
    { message: "Povolené sadzby DPH: 0, 5, 19, 23" },
  ),
);

export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, "Zadaj aspoň 2 znaky")
    .max(100, "Hľadaný výraz je príliš dlhý"),
});

export type SearchQueryValues = z.infer<typeof searchQuerySchema>;
