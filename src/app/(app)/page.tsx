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
    listInvoices({ page: 1, pageSize: 6 }),
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
      amount: overview.outstandingAmount - overview.overdueAmount,
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
        : `Inkaso ${overview.collectionRatePercent.toFixed(0)} % · ${formatDate(overview.asOf)}`;

  return (
    <>
      <MotionItem className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.01em] text-ink">
            Prehľad
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">{finding}</p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">Nová faktúra</Link>
        </Button>
      </MotionItem>

      {/* 306 + 24 + 822 = 1152 */}
      <div className="grid gap-6 lg:grid-cols-[306px_minmax(0,1fr)]">
        <MotionItem className="panel flex h-fit flex-col p-5 lg:sticky lg:top-4 lg:max-h-[calc(100svh-2rem)] lg:overflow-auto">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <span className="text-[16px] font-medium text-ink">Stavy</span>
            <span className="money text-[16px] font-semibold text-ink">
              {formatMoney(overview.outstandingAmount, overview.currency)}
            </span>
          </div>
          <p className="mb-4 text-[12px] text-muted-foreground">
            Neuhradené celkom · {formatDate(overview.asOf)}
          </p>

          <ul>
            {buckets.map((b) => (
              <li key={b.key}>
                <Link
                  href={b.href}
                  className="flex items-baseline justify-between gap-3 rounded-[6px] py-2.5 pr-1 hover:bg-raised/60"
                >
                  <span
                    className={
                      b.tone === "muted"
                        ? "text-[14px] text-muted-foreground"
                        : "text-[14px] text-ink"
                    }
                  >
                    {b.label}
                    <span className="ml-1.5 text-muted-foreground">{b.count}</span>
                  </span>
                  <span
                    className={
                      b.tone === "negative"
                        ? "money text-[14px] text-negative"
                        : b.tone === "positive"
                          ? "money text-[14px] text-positive"
                          : b.tone === "muted"
                            ? "data-num text-[14px] text-muted-foreground"
                            : "money text-[14px] text-ink"
                    }
                  >
                    {b.key === "draft"
                      ? "—"
                      : formatMoney(Math.max(0, b.amount), overview.currency)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-rule pt-4">
            <p className="text-[12px] text-muted-foreground">Vystavené v období</p>
            <p className="money mt-1 text-[24px] font-bold text-ink">
              {formatMoney(overview.issuedAmount, overview.currency)}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {overview.totalInvoices} faktúr · miera inkasa{" "}
              {overview.collectionRatePercent.toFixed(0)} %
            </p>
          </div>
        </MotionItem>

        <div className="grid items-start gap-6">
          <MotionItem className="panel p-5">
            <header className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[16px] font-medium text-ink">Splatnosti</h2>
              <Link
                href="/reminders"
                className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
              >
                Všetky
              </Link>
            </header>
            {reminders.length === 0 ? (
              <p className="text-[14px] text-muted-foreground">
                V horizonte 14 dní nie sú splatné ani omeškané faktúry.
              </p>
            ) : (
              <ul className="divide-y divide-rule">
                {reminders.slice(0, 5).map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/invoices/${r.id}`}
                        className="data-num text-[14px] font-medium hover:underline"
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
                          ? "money shrink-0 text-[14px] text-negative"
                          : "money shrink-0 text-[14px] text-ink"
                      }
                    >
                      {formatMoney(r.total, r.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </MotionItem>

          <MotionItem className="panel p-5">
            <header className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[16px] font-medium text-ink">
                Posledné faktúry
              </h2>
              <Link
                href="/invoices"
                className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
              >
                Všetky
              </Link>
            </header>
            {recent.items.length === 0 ? (
              <div className="flex flex-col items-start gap-2 py-1">
                <p className="text-[14px] text-ink">Zatiaľ žiadne faktúry</p>
                <p className="text-[14px] text-muted-foreground">
                  Vystav prvú: číslo, VS a IBAN pôjdu do PDF.
                </p>
                <Button asChild className="mt-2" size="sm">
                  <Link href="/invoices/new">Nová faktúra</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-rule">
                {recent.items.map((inv) => (
                  <li
                    key={inv.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[7rem_1fr_auto_auto]"
                  >
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="data-num text-[14px] font-medium hover:underline"
                    >
                      {inv.number}
                    </Link>
                    <span className="col-span-2 truncate text-[14px] sm:col-span-1">
                      {inv.customerName}
                    </span>
                    <StatusBadge status={inv.status} />
                    <span className="money text-right text-[14px]">
                      {formatMoney(inv.total, inv.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </MotionItem>

          <MotionItem className="panel p-5">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h2 className="mb-3 text-[16px] font-medium text-ink">Inkaso</h2>
                <p className="money text-[30px] font-bold leading-9 text-chart">
                  {overview.collectionRatePercent.toFixed(0)}
                  <span className="ml-0.5 text-[16px] font-medium text-muted-foreground">
                    %
                  </span>
                </p>
                <p className="mt-2 text-[12px] text-muted-foreground">
                  Zaplatené {formatMoney(overview.paidAmount, overview.currency)}{" "}
                  z vystavených{" "}
                  {formatMoney(overview.issuedAmount, overview.currency)}
                </p>
                {overview.averageDaysToPay != null ? (
                  <p className="mt-3 text-[14px] text-ink">
                    Priemerne{" "}
                    <span className="data-num font-medium">
                      {overview.averageDaysToPay.toFixed(0)} dní
                    </span>{" "}
                    do úhrady
                  </p>
                ) : (
                  <p className="mt-3 text-[14px] text-muted-foreground">
                    Priemer dní do úhrady sa zobrazí po prvej platbe.
                  </p>
                )}
              </div>
              <div>
                <h2 className="mb-3 text-[16px] font-medium text-ink">
                  Podľa stavu
                </h2>
                {overview.byStatus.length === 0 ? (
                  <p className="text-[14px] text-muted-foreground">
                    Zatiaľ žiadne stavy na rozdelenie.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {overview.byStatus.map((row) => (
                      <li
                        key={row.status}
                        className="flex items-baseline justify-between gap-3 text-[14px]"
                      >
                        <span className="text-muted-foreground">
                          {statusLabel[row.status]}
                          <span className="ml-1 data-num">{row.count}</span>
                        </span>
                        <span className="money text-ink">
                          {formatMoney(row.amount, overview.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </MotionItem>
        </div>
      </div>
    </>
  );
}
