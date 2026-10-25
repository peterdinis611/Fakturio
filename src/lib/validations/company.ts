import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" || v === undefined ? null : v));

export const companySchema = z.object({
  name: z.string().trim().min(1, "Názov firmy je povinný"),
  legalForm: optionalString,
  ico: optionalString,
  dic: optionalString,
  icDph: optionalString,
  isVatPayer: z.boolean(),
  commercialRegister: optionalString,
  email: optionalString,
  invoiceEmail: optionalString,
  phone: optionalString,
  website: optionalString,
  contactPerson: optionalString,
  street: optionalString,
  city: optionalString,
  postalCode: optionalString,
  country: z.string().trim().min(2, "Krajina je povinná").default("SK"),
  bankIban: optionalString,
  bankBic: optionalString,
  bankName: optionalString,
  defaultDueDays: z.coerce.number().int().min(0).max(365),
  defaultVatRate: z.coerce.number().min(0).max(100),
  defaultCurrency: z.string().trim().min(3).max(3).default("EUR"),
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
  defaultVatRate: z.coerce.number().min(0).max(100),
  defaultCurrency: z.string().trim().min(3).max(3),
  invoicePrefix: optionalString,
  defaultPaymentMethod: optionalString,
  defaultConstantSymbol: optionalString,
  defaultInvoiceNotes: optionalString,
  invoiceFooter: optionalString,
});
