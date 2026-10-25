import Link from "next/link";
import { getReminders, listInvoices } from "@/actions/invoices";
import { getReportOverview } from "@/actions/reports";
import { dueDaysLabel } from "@/components/dashboard/due-days";
import { PageHeader } from "@/components/layout/page-header";
import { MotionItem } from "@/components/motion/page-motion";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Prehľad" };

export default async function DashboardPage() {
  const [overview, recent, reminders] = await Promise.all([
    getReportOverview(),
    listInvoices({ page: 1, pageSize: 8 }),
    getReminders({ withinDays: 14 }),
  ]);

  const isEmpty = overview.totalInvoices === 0;
  const unpaidOpen = Math.max(
    0,
    overview.outstandingAmount - overview.overdueAmount,
  );

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
      label: "Koncepty",
      count: overview.draftCount,
      amount: null as number | null,
      href: "/invoices?status=Draft",
      tone: "muted" as const,
    },
  ];

  const mixTotal =
    overview.paidAmount + unpaidOpen + overview.overdueAmount;
  const mix = {
    paid: mixTotal > 0 ? (overview.paidAmount / mixTotal) * 100 : 0,
    open: mixTotal > 0 ? (unpaidOpen / mixTotal) * 100 : 0,
    overdue: mixTotal > 0 ? (overview.overdueAmount / mixTotal) * 100 : 0,
  };

  const finding = isEmpty
    ? "Zatiaľ prázdny ledger — vystav prvú faktúru."
    : overview.overdueCount > 0
      ? `${overview.overdueCount} po splatnosti · ${formatMoney(overview.overdueAmount, overview.currency)}`
      : reminders.length > 0
        ? `${reminders.length} splatností v najbližších 14 dňoch`
        : `K ${formatDate(overview.asOf)} · ${overview.totalInvoices} faktúr`;

  if (isEmpty) {
    return (
      <>
        <PageHeader
          title="Prehľad"
          description={finding}
        />

        <MotionItem className="panel mt-2 max-w-xl px-5 py-6 sm:px-6 sm:py-7">
          <span className="stamp" aria-hidden>
            F
          </span>
          <h2 className="mt-4 text-[18px] font-semibold tracking-tight text-ink">
            Vystav prvú faktúru
          </h2>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted-foreground">
            Dostane číslo, variabilný symbol a IBAN do PDF. Potom tu uvidíš
            neuhradené, splatnosti a inkaso.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
            <Button asChild>
              <Link href="/invoices/new">Nová faktúra</Link>
            </Button>
            <Link
              href="/customers/new"
              className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
            >
              Pridať zákazníka
            </Link>
            <Link
              href="/settings"
              className="text-[13px] text-muted-foreground underline-offset-2 hover:underline"
            >
              Nastavenia
            </Link>
          </div>
        </MotionItem>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Prehľad"
        description={finding}
        actions={
          <Button asChild>
            <Link href="/invoices/new">Nová faktúra</Link>
          </Button>
        }
      />

      {overview.overdueCount > 0 ? (
        <MotionItem className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
          <p className="text-[14px] text-ink">
            <span className="stamp mr-2 inline-flex border-negative text-negative">
              !
            </span>
            {overview.overdueCount}{" "}
            {overview.overdueCount === 1 ? "faktúra je" : "faktúr je"} po
            splatnosti —{" "}
            <span className="money text-negative">
              {formatMoney(overview.overdueAmount, overview.currency)}
            </span>
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/reminders?overdue=1">Riešiť upomienky</Link>
          </Button>
        </MotionItem>
      ) : null}

      {/* Lead answer + platobný pás */}
      <MotionItem className="mb-8">
        <div className="grid gap-6 sm:grid-cols-[1.4fr_auto_auto] sm:items-end">
          <div>
            <p className="text-[13px] text-muted-foreground">Neuhradené celkom</p>
            <p
              className={cn(
                "money mt-1 text-[32px] leading-none tracking-tight",
                overview.outstandingAmount > 0 ? "text-ink" : "text-faint",
              )}
            >
              {formatMoney(overview.outstandingAmount, overview.currency)}
            </p>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground">Inkaso</p>
            <p className="money mt-1 text-[24px] leading-none text-chart">
              {overview.collectionRatePercent.toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground">Vystavené</p>
            <p className="money mt-1 text-[24px] leading-none text-ink">
              {formatMoney(overview.issuedAmount, overview.currency)}
            </p>
          </div>
        </div>

        {mixTotal > 0 ? (
          <div className="mt-5" aria-hidden>
            <div className="bar-track flex">
              {mix.paid > 0 ? (
                <div
                  className="h-full bg-positive/70"
                  style={{ width: `${mix.paid}%` }}
                />
              ) : null}
              {mix.open > 0 ? (
                <div
                  className="h-full bg-chart"
                  style={{ width: `${mix.open}%` }}
                />
              ) : null}
              {mix.overdue > 0 ? (
                <div
                  className="h-full bg-negative"
                  style={{ width: `${mix.overdue}%` }}
                />
              ) : null}
            </div>
            <div className="ledger-strip mt-2 mb-0 border-0 pb-0 text-[12px]">
              <span>
                <span className="mr-1.5 inline-block size-1.5 bg-positive/70" />
                Zaplatené{" "}
                <span className="money text-ink">
                  {formatMoney(overview.paidAmount, overview.currency)}
                </span>
              </span>
              <span>
                <span className="mr-1.5 inline-block size-1.5 bg-chart" />
                Otvorené{" "}
                <span className="money text-ink">
                  {formatMoney(unpaidOpen, overview.currency)}
                </span>
              </span>
              {overview.overdueAmount > 0 ? (
                <span>
                  <span className="mr-1.5 inline-block size-1.5 bg-negative" />
                  Po splatnosti{" "}
                  <span className="money text-negative">
                    {formatMoney(overview.overdueAmount, overview.currency)}
                  </span>
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </MotionItem>

      <div className="grid gap-10 lg:grid-cols-2">
        <MotionItem>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[15px] font-medium text-ink">Stavy</h2>
            <Link
              href="/invoices"
              className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
            >
              Všetky
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
                      b.tone === "muted"
                        ? "text-muted-foreground"
                        : "text-ink",
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
              Upomienky
            </Link>
          </div>
          {reminders.length === 0 ? (
            <div className="border-t border-rule py-5">
              <p className="text-[14px] text-ink">Nič nesplatné v 14 dňoch</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Keď sa blíži splatnosť, uvidíš tu faktúry na upomienku.
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
                        {dueDaysLabel(r)} · {formatDate(r.dueDate)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "money shrink-0 text-[14px]",
                      r.isOverdue ? "text-negative" : "text-ink",
                    )}
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
        <ul className="divide-y divide-rule border-t border-rule">
          {recent.items.map((inv) => (
            <li
              key={inv.id}
              className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto_6.5rem_auto]"
            >
              <Link
                href={`/invoices/${inv.id}`}
                className="data-num text-[14px] font-medium hover:underline"
              >
                {inv.number}
              </Link>
              <span className="truncate text-[14px] text-ink">
                {inv.customerName}
              </span>
              <span className="hidden sm:inline">
                <StatusBadge status={inv.status} />
              </span>
              <span className="hidden text-right text-[12px] text-muted-foreground sm:block">
                {formatDate(inv.dueDate)}
              </span>
              <span className="money text-right text-[14px]">
                {formatMoney(inv.total, inv.currency)}
              </span>
            </li>
          ))}
        </ul>
      </MotionItem>
    </>
  );
}
