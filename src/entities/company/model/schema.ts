import { z } from "zod";
import {
  countryCode,
  currencyCode,
  optionalBic,
  optionalDic,
  optionalEmail,
  optionalIban,
  optionalIcDph,
  optionalIco,
  optionalPostalCode,
  optionalString,
  vatRateSchema,
} from "@/shared/lib/validations/common";
import { isValidEmail, isValidIban, isValidIco, isValidPostalCode } from "@/shared/lib/validations/sk";

export const companySchema = z
  .object({
    name: z.string().trim().min(1, "Názov firmy je povinný").max(200),
    legalForm: optionalString,
    ico: optionalIco.refine((v) => v !== null && isValidIco(v), {
      message: "IČO je povinné (8 číslic + kontrolná cifra)",
    }),
    dic: optionalDic,
    icDph: optionalIcDph,
    isVatPayer: z.boolean(),
    commercialRegister: optionalString,
    email: optionalEmail.refine((v) => v !== null && isValidEmail(v), {
      message: "E-mail je povinný",
    }),
    invoiceEmail: optionalEmail,
    phone: optionalString,
    website: optionalString,
    contactPerson: optionalString,
    street: optionalString.refine((v) => v !== null && v.length > 0, {
      message: "Ulica je povinná",
    }),
    city: optionalString.refine((v) => v !== null && v.length > 0, {
      message: "Mesto je povinné",
    }),
    postalCode: optionalPostalCode.refine(
      (v) => v !== null && isValidPostalCode(v),
      { message: "PSČ je povinné (tvar 123 45)" },
    ),
    country: countryCode.default("SK"),
    bankIban: optionalIban.refine((v) => v !== null && isValidIban(v), {
      message: "IBAN je povinný",
    }),
    bankBic: optionalBic,
    bankName: optionalString,
    defaultDueDays: z.coerce.number().int().min(0).max(365),
    defaultVatRate: vatRateSchema,
    defaultCurrency: currencyCode.default("EUR"),
    invoicePrefix: optionalString,
    defaultPaymentMethod: optionalString,
    defaultConstantSymbol: optionalString,
    defaultInvoiceNotes: optionalString,
    invoiceFooter: optionalString,
    logoUrl: optionalString,
    notes: optionalString,
  })
  .superRefine((values, ctx) => {
    if (values.isVatPayer && !values.icDph) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["icDph"],
        message: "IČ DPH je povinné pri platcovi DPH",
      });
    }
  });

export type CompanyFormValues = z.infer<typeof companySchema>;

export const companyDefaultsSchema = z.object({
  defaultDueDays: z.coerce.number().int().min(0).max(365),
  defaultVatRate: vatRateSchema,
  defaultCurrency: currencyCode,
  invoicePrefix: optionalString,
  defaultPaymentMethod: optionalString,
  defaultConstantSymbol: optionalString,
  defaultInvoiceNotes: optionalString,
  invoiceFooter: optionalString,
});
