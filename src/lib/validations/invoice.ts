import { z } from "zod";
import {
  currencyCode,
  optionalBic,
  optionalIban,
  optionalString,
  optionalVariableSymbol,
  optionalVatRate,
} from "@/lib/validations/common";

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, "Popis položky je povinný").max(500),
  unit: z.string().trim().min(1).max(20).default("ks"),
  quantity: z.coerce.number().positive("Množstvo musí byť > 0"),
  unitPrice: z.coerce.number().min(0, "Cena nemôže byť záporná"),
  vatRate: optionalVatRate,
});

export const invoiceSchema = z.object({
  customerId: z.string().uuid("Vyber zákazníka"),
  issueDate: optionalString,
  dueDate: optionalString,
  deliveryDate: optionalString,
  currency: currencyCode.default("EUR"),
  variableSymbol: optionalVariableSymbol,
  constantSymbol: optionalString,
  specificSymbol: optionalString,
  paymentMethod: optionalString,
  bankIban: optionalIban,
  bankBic: optionalBic,
  notes: optionalString,
  items: z.array(invoiceItemSchema).min(1, "Pridaj aspoň jednu položku"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const cancelSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Dôvod zrušenia je povinný")
    .max(500, "Dôvod je príliš dlhý"),
});

export type CancelFormValues = z.infer<typeof cancelSchema>;

export const markPaidSchema = z.object({
  paidAt: optionalString.optional(),
});

export type MarkPaidFormValues = z.infer<typeof markPaidSchema>;
