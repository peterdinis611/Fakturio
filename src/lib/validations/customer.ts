import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" || v === undefined ? null : v));

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Názov je povinný"),
  ico: optionalString,
  dic: optionalString,
  icDph: optionalString,
  email: optionalString,
  phone: optionalString,
  street: optionalString,
  city: optionalString,
  postalCode: optionalString,
  country: z.string().trim().min(2).default("SK"),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
