import Link from "next/link";
import type { ReportOverview } from "@/shared/api/types";
import { formatMoney } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  overview: ReportOverview;
  locale: AppLocale;
  labels: {
    paid: string;
    unpaid: string;
    drafts: string;
    all: string;
  };
};

export function StatusBuckets({ overview, locale, labels }: Props) {
  const unpaidOpen = Math.max(
    0,
    overview.outstandingAmount - overview.overdueAmount,
  );

  const buckets = [
    {
      key: "paid",
      label: labels.paid,
      count: overview.paidCount,
      amount: overview.paidAmount,
      href: "/invoices?status=Paid",
      tone: "positive" as const,
    },
    {
      key: "outstanding",
      label: labels.unpaid,
      count: overview.issuedCount,
      amount: unpaidOpen,
      href: "/invoices?status=Issued",
      tone: "ink" as const,
    },
    {
      key: "overdue",
      label: "Po splatnosti",
      count: overview.overdueCount,
      amount: overview.overdueAmount,
      href: "/invoices?overdue=1",
      tone: "negative" as const,
    },
    {
      key: "draft",
      label: labels.drafts,
      count: overview.draftCount,
      amount: null as number | null,
      href: "/invoices?status=Draft",
      tone: "muted" as const,
    },
  ];

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[15px] font-medium text-ink">Stavy</h2>
        <Link
          href="/invoices"
          className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
        >
          {labels.all}
        </Link>
      </div>
      <ul className="divide-y divide-rule border-t border-rule">
        {buckets.map((b) => (
          <li key={b.key}>
            <Link
              href={b.href}
              className="group flex items-baseline justify-between gap-3 py-3 transition-colors hover:bg-raised/50"
            >
              <span
                className={cn(
                  "text-[14px]",
                  b.tone === "muted" ? "text-muted-foreground" : "text-ink",
                )}
              >
                {b.label}
                <span className="ml-1.5 text-faint data-num">{b.count}</span>
              </span>
              <span
                className={cn(
                  "money text-[14px] tabular-nums",
                  b.tone === "negative" && "text-negative",
                  b.tone === "positive" && "text-positive",
                  b.tone === "muted" && "text-faint",
                  b.tone === "ink" && "text-ink",
                )}
              >
                {b.amount === null
                  ? "—"
                  : formatMoney(b.amount, overview.currency, locale)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
