import { z } from "zod";
import { optionalVatRate } from "@/shared/lib/validations/common";

export const serviceCatalogSchema = z.object({
  description: z.string().trim().min(1, "Popis je povinný").max(500),
  unit: z.string().trim().min(1).max(20).default("ks"),
  unitPrice: z.coerce.number().min(0, "Cena nesmie byť záporná"),
  vatRate: optionalVatRate,
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().optional(),
});

export type ServiceCatalogFormValues = z.infer<typeof serviceCatalogSchema>;
export type ServiceCatalogFormInput = z.input<typeof serviceCatalogSchema>;
