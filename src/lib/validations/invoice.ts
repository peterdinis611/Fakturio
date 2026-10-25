import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" || v === undefined ? null : v));

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, "Popis položky je povinný"),
  unit: z.string().trim().default("ks"),
  quantity: z.coerce.number().positive("Množstvo musí byť > 0"),
  unitPrice: z.coerce.number().min(0, "Cena nemôže byť záporná"),
  vatRate: z.coerce.number().min(0).max(100).nullable().optional(),
});

export const invoiceSchema = z.object({
  customerId: z.string().uuid("Vyber zákazníka"),
  issueDate: optionalString,
  dueDate: optionalString,
  deliveryDate: optionalString,
  currency: z.string().trim().min(3).max(3).default("EUR"),
  variableSymbol: optionalString,
  constantSymbol: optionalString,
  specificSymbol: optionalString,
  paymentMethod: optionalString,
  bankIban: optionalString,
  bankBic: optionalString,
  notes: optionalString,
  items: z.array(invoiceItemSchema).min(1, "Pridaj aspoň jednu položku"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const cancelSchema = z.object({
  reason: z.string().trim().min(3, "Dôvod zrušenia je povinný"),
});
