import Link from "next/link";
import { getReminders, listInvoices } from "@/actions/invoices";
import { getReportOverview } from "@/actions/reports";
import { MotionItem } from "@/components/motion/page-motion";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney, statusLabel } from "@/lib/format";

export const metadata = { title: "Prehľad" };

export default async function DashboardPage() {
  const [overview, recent, reminders] = await Promise.all([
    getReportOverview(),
    listInvoices({ page: 1, pageSize: 8 }),
    getReminders({ withinDays: 14 }),
  ]);

  const buckets = [
    {
      key: "paid",
      label: "Zaplatené",
      count: overview.paidCount,
      amount: overview.paidAmount,
      href: "/invoices?status=Paid",
      tone: "positive" as const,
    },
    {
      key: "outstanding",
      label: "Neuhradené",
      count: overview.issuedCount,
      amount: Math.max(0, overview.outstandingAmount - overview.overdueAmount),
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
      label: "Koncepty",
      count: overview.draftCount,
      amount: 0,
      href: "/invoices?status=Draft",
      tone: "muted" as const,
    },
  ];

  const finding =
    overview.overdueCount > 0
      ? `${overview.overdueCount} faktúr po splatnosti · ${formatMoney(overview.overdueAmount, overview.currency)}`
      : reminders.length > 0
        ? `${reminders.length} splatností v najbližších 14 dňoch`
        : `K ${formatDate(overview.asOf)} · ${overview.totalInvoices} faktúr`;

  return (
    <>
      <MotionItem className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-ink">Prehľad</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">{finding}</p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">Nová faktúra</Link>
        </Button>
      </MotionItem>

      {/* Lead answer: neuhradené — not a KPI tile row */}
      <MotionItem className="mb-8 grid gap-6 border-b border-rule pb-8 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div>
          <p className="text-[14px] text-muted-foreground">Neuhradené celkom</p>
          <p
            className={`money mt-1 text-[28px] leading-none ${
              overview.outstandingAmount > 0 ? "text-ink" : "text-faint"
            }`}
          >
            {formatMoney(overview.outstandingAmount, overview.currency)}
          </p>
        </div>
        <div>
          <p className="text-[14px] text-muted-foreground">Inkaso</p>
          <p className="money mt-1 text-[22px] text-chart">
            {overview.collectionRatePercent.toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-[14px] text-muted-foreground">Vystavené</p>
          <p className="money mt-1 text-[22px] text-ink">
            {formatMoney(overview.issuedAmount, overview.currency)}
          </p>
        </div>
      </MotionItem>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <MotionItem>
          <h2 className="mb-3 text-[15px] font-medium text-ink">Stavy</h2>
          <ul className="panel-flat divide-y divide-rule">
            {buckets.map((b) => (
              <li key={b.key}>
                <Link
                  href={b.href}
                  className="flex items-baseline justify-between gap-3 px-0 py-3 hover:bg-raised/40"
                >
                  <span
                    className={
                      b.tone === "muted"
                        ? "text-[14px] text-muted-foreground"
                        : "text-[14px] text-ink"
                    }
                  >
                    {b.label}
                    <span className="ml-1.5 text-faint">{b.count}</span>
                  </span>
                  <span
                    className={
                      b.tone === "negative"
                        ? "money text-[14px] text-negative"
                        : b.tone === "positive"
                          ? "money text-[14px] text-positive"
                          : b.tone === "muted"
                            ? "text-[14px] text-faint"
                            : "money text-[14px] text-ink"
                    }
                  >
                    {b.key === "draft"
                      ? "—"
                      : formatMoney(b.amount, overview.currency)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </MotionItem>

        <MotionItem>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[15px] font-medium text-ink">Splatnosti</h2>
            <Link
              href="/reminders"
              className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
            >
              Všetky
            </Link>
          </div>
          {reminders.length === 0 ? (
            <p className="py-2 text-[14px] text-muted-foreground">
              V horizonte 14 dní nič nesplatné.
            </p>
          ) : (
            <ul className="divide-y divide-rule">
              {reminders.slice(0, 5).map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/invoices/${r.id}`}
                      className="text-[14px] font-medium hover:underline"
                    >
                      {r.number}
                    </Link>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {r.customerName} · {formatDate(r.dueDate)}
                    </p>
                  </div>
                  <span
                    className={
                      r.isOverdue
                        ? "money text-[14px] text-negative"
                        : "money text-[14px]"
                    }
                  >
                    {formatMoney(r.total, r.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </MotionItem>
      </div>

      <MotionItem className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[15px] font-medium text-ink">Posledné faktúry</h2>
          <Link
            href="/invoices"
            className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
          >
            Všetky
          </Link>
        </div>
        {recent.items.length === 0 ? (
          <div className="flex flex-wrap items-end justify-between gap-4 border border-border bg-surface px-4 py-5">
            <div>
              <p className="text-[15px] font-medium text-ink">
                Zatiaľ žiadne faktúry
              </p>
              <p className="mt-1 text-[14px] text-muted-foreground">
                Prvá faktúra dostane číslo, VS a IBAN do PDF.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/invoices/new">Nová faktúra</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-rule border-t border-rule">
            {recent.items.map((inv) => (
              <li
                key={inv.id}
                className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 py-3 sm:grid-cols-[7rem_1fr_auto_auto]"
              >
                <Link
                  href={`/invoices/${inv.id}`}
                  className="text-[14px] font-medium hover:underline"
                >
                  {inv.number}
                </Link>
                <span className="truncate text-[14px]">{inv.customerName}</span>
                <span className="hidden sm:inline">
                  <StatusBadge status={inv.status} />
                </span>
                <span className="money text-right text-[14px]">
                  {formatMoney(inv.total, inv.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </MotionItem>

      {overview.byStatus.length > 0 ? (
        <MotionItem className="mt-10">
          <h2 className="mb-3 text-[15px] font-medium text-ink">Podľa stavu</h2>
          <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {overview.byStatus.map((row) => (
              <li
                key={row.status}
                className="flex items-baseline justify-between gap-3 text-[14px]"
              >
                <span className="text-muted-foreground">
                  {statusLabel[row.status]}
                  <span className="ml-1 text-faint">{row.count}</span>
                </span>
                <span className="money">{formatMoney(row.amount, overview.currency)}</span>
              </li>
            ))}
          </ul>
        </MotionItem>
      ) : null}
    </>
  );
}
