import Link from "next/link";
import type { InvoiceReminder } from "@/shared/api/types";
import {
  dueDaysLabel,
  type DueDaysTranslate,
} from "@/widgets/dashboard/due-days";
import { formatDate, formatMoney } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  reminders: InvoiceReminder[];
  locale: AppLocale;
  t: DueDaysTranslate;
  labels: {
    title: string;
    empty: string;
    emptyHint: string;
  };
};

export function UpcomingDue({ reminders, locale, t, labels }: Props) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[15px] font-medium text-ink">{labels.title}</h2>
        <Link
          href="/reminders"
          className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
        >
          Upomienky
        </Link>
      </div>
      {reminders.length === 0 ? (
        <div className="border-t border-rule py-5">
          <p className="text-[14px] text-ink">{labels.empty}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {labels.emptyHint}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-rule border-t border-rule">
          {reminders.slice(0, 5).map((r) => (
            <li
              key={r.id}
              className="flex items-start justify-between gap-3 py-3"
            >
              <div className="flex min-w-0 items-start gap-2.5">
                <span
                  aria-hidden
                  className={cn(
                    "stamp mt-0.5 shrink-0",
                    r.isOverdue
                      ? "border-negative text-negative"
                      : "border-ink text-ink",
                  )}
                >
                  {r.isOverdue ? "!" : "F"}
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/invoices/${r.id}`}
                    className="data-num text-[14px] font-medium hover:underline"
                  >
                    {r.number}
                  </Link>
                  <p className="truncate text-[13px] text-muted-foreground">
                    {r.customerName}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-[12px]",
                      r.isOverdue ? "text-negative" : "text-faint",
                    )}
                  >
                    {dueDaysLabel(r, t)} · {formatDate(r.dueDate, locale)}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "money shrink-0 text-[14px]",
                  r.isOverdue ? "text-negative" : "text-ink",
                )}
              >
                {formatMoney(r.total, r.currency, locale)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
