import { z } from "zod";

export type RecurrenceInterval = "Monthly" | "Quarterly" | "Yearly";

export type RecurringListItem = {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  interval: RecurrenceInterval;
  dayOfMonth: number;
  dueDays: number;
  isActive: boolean;
  nextRunOn: string;
  lastGeneratedOn: string | null;
  lastInvoiceId: string | null;
  itemCount: number;
  updatedAt: string;
};

export type RecurringInvoiceItem = {
  id: string;
  serviceCatalogItemId: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  sortOrder: number;
};

export type RecurringInvoice = {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  interval: RecurrenceInterval;
  dayOfMonth: number;
  dueDays: number;
  isActive: boolean;
  nextRunOn: string;
  lastGeneratedOn: string | null;
  lastInvoiceId: string | null;
  notes: string | null;
  items: RecurringInvoiceItem[];
  createdAt: string;
  updatedAt: string;
};

export const recurringItemSchema = z.object({
  serviceCatalogItemId: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1).max(500),
  unit: z.string().trim().min(1).max(20).default("ks"),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  vatRate: z.number().min(0).max(100).optional(),
});

export const recurringSchema = z.object({
  customerId: z.string().uuid("Vyber odberateľa"),
  name: z.string().trim().min(1, "Názov je povinný").max(200),
  interval: z.enum(["Monthly", "Quarterly", "Yearly"]),
  dayOfMonth: z.number().int().min(1).max(28).optional(),
  dueDays: z.number().int().min(0).max(365).optional(),
  nextRunOn: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  notes: z.string().max(2000).optional().nullable(),
  items: z.array(recurringItemSchema).min(1, "Pridaj aspoň jednu položku"),
});

export type RecurringFormValues = z.infer<typeof recurringSchema>;
export type RecurringFormInput = z.input<typeof recurringSchema>;
