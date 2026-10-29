import { z } from "zod";
import {
  countryCode,
  optionalDic,
  optionalEmail,
  optionalIcDph,
  optionalIco,
  optionalPostalCode,
  optionalString,
} from "@/shared/lib/validations/common";

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Názov je povinný").max(200),
  ico: optionalIco,
  dic: optionalDic,
  icDph: optionalIcDph,
  email: optionalEmail,
  phone: optionalString,
  street: optionalString,
  city: optionalString,
  postalCode: optionalPostalCode,
  country: countryCode.default("SK"),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
