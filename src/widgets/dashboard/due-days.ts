import type { InvoiceReminder } from "@/shared/api/types";

/** Minimal Dashboard keys used for due-date labels. */
export type DueDaysTranslate = (
  key: "dueToday" | "dueInDays" | "dueYesterday" | "overdueDays",
  values?: { count: number },
) => string;

export function dueDaysLabel(
  r: Pick<InvoiceReminder, "isOverdue" | "daysUntilDue">,
  t: DueDaysTranslate,
) {
  if (r.isOverdue) {
    const days = Math.abs(r.daysUntilDue);
    return t("overdueDays", { count: days });
  }
  if (r.daysUntilDue === 0) return t("dueToday");
  if (r.daysUntilDue === 1) return t("dueInDays", { count: 1 });
  return t("dueInDays", { count: r.daysUntilDue });
}
