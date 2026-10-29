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

export const companySchema = z.object({
  name: z.string().trim().min(1, "Názov firmy je povinný").max(200),
  legalForm: optionalString,
  ico: optionalIco,
  dic: optionalDic,
  icDph: optionalIcDph,
  isVatPayer: z.boolean(),
  commercialRegister: optionalString,
  email: optionalEmail,
  invoiceEmail: optionalEmail,
  phone: optionalString,
  website: optionalString,
  contactPerson: optionalString,
  street: optionalString,
  city: optionalString,
  postalCode: optionalPostalCode,
  country: countryCode.default("SK"),
  bankIban: optionalIban,
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
