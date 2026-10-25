import type { InvoiceReminder } from "@/lib/api/types";

export function dueDaysLabel(r: Pick<InvoiceReminder, "isOverdue" | "daysUntilDue">) {
  if (r.isOverdue) {
    const days = Math.abs(r.daysUntilDue);
    return days === 0 ? "Dnes po splatnosti" : `${days} d po splatnosti`;
  }
  if (r.daysUntilDue === 0) return "Splatné dnes";
  if (r.daysUntilDue === 1) return "Zajtra";
  return `O ${r.daysUntilDue} dní`;
}
