import Link from "next/link";
import {
  getAgingReport,
  getMonthlyRevenue,
  getReportOverview,
  getTopCustomers,
  getVatReport,
} from "@/features/reports/api/reports";
import { FadeIn } from "@/shared/ui/motion/page-motion";
import { AgingChart } from "@/features/reports/ui/aging-chart";
import { MonthlyRevenueChart } from "@/features/reports/ui/monthly-chart";
import { StatusChart } from "@/features/reports/ui/status-chart";
import { TopCustomersChart } from "@/features/reports/ui/top-customers-chart";
import { VatChart } from "@/features/reports/ui/vat-chart";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { vatExportHref } from "@/shared/lib/exports";
import { formatDate, formatMoney, formatPercent } from "@/shared/lib/format";

export type ReportsDashboardData = Awaited<
  ReturnType<typeof loadReportsDashboard>
>;

export async function loadReportsDashboard(params: {
  year: number;
  from?: string;
  to?: string;
  top: number;
}) {
  const range = { from: params.from, to: params.to };
  const [overview, monthly, aging, topCustomers, vat] = await Promise.all([
    getReportOverview(range),
    getMonthlyRevenue(params.year),
    getAgingReport(params.top),
    getTopCustomers({ ...range, limit: params.top }),
    getVatReport(range),
  ]);
  return { overview, monthly, aging, topCustomers, vat, ...params };
}

export async function ReportsDashboard(props: {
  year: number;
  from?: string;
  to?: string;
  top: number;
}) {
  const { overview, monthly, aging, topCustomers, vat, from, to, top } =
    await loadReportsDashboard(props);

  return (
    <div>
      <div className="ledger-strip mb-5">
        <span>
          Stav k <span className="text-ink">{formatDate(overview.asOf)}</span>
        </span>
        <span className="data-num">
          Inkaso {formatPercent(overview.collectionRatePercent)}
        </span>
        {overview.averageDaysToPay != null ? (
          <span className="data-num">
            Ø {overview.averageDaysToPay.toFixed(0)} dní do úhrady
          </span>
        ) : null}
        <span className="data-num text-faint">{overview.currency}</span>
      </div>

      <FadeIn delay={0.04}>
        <section className="mb-8">
          <div className="panel grid divide-y divide-rule sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {[
              {
                label: "Vystavené",
                value: formatMoney(overview.issuedAmount, overview.currency),
                hint: `${overview.totalInvoices} faktúr`,
              },
              {
                label: "Zaplatené",
                value: formatMoney(overview.paidAmount, overview.currency),
                hint: `${overview.paidCount} úhrad`,
                accent: true,
              },
              {
                label: "Neuhradené",
                value: formatMoney(
                  overview.outstandingAmount,
                  overview.currency,
                ),
                hint: `${overview.issuedCount} vystavených`,
              },
              {
                label: "Po splatnosti",
                value: formatMoney(overview.overdueAmount, overview.currency),
                hint: `${overview.overdueCount} faktúr`,
                bad: overview.overdueAmount > 0,
              },
            ].map((k) => (
              <div key={k.label} className="px-5 py-4">
                <p className="text-[13px] text-muted-foreground">{k.label}</p>
                <p
                  className={`money mt-1 text-[22px] leading-7 font-bold ${
                    k.bad
                      ? "text-negative"
                      : k.accent
                        ? "text-chart"
                        : "text-ink"
                  }`}
                >
                  {k.value}
                </p>
                <p className="mt-1 text-[12px] text-faint">{k.hint}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <section className="mb-8">
          <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[16px] font-medium text-ink">
              Mesačný pohyb {monthly.year}
            </h2>
            <div className="flex flex-wrap gap-4 text-[12px] text-muted-foreground">
              <span>
                Vystavené{" "}
                <span className="money text-ink">
                  {formatMoney(monthly.yearIssuedTotal, monthly.currency)}
                </span>
              </span>
              <span>
                Zaplatené{" "}
                <span className="money text-chart">
                  {formatMoney(monthly.yearPaidTotal, monthly.currency)}
                </span>
              </span>
            </div>
          </header>
          <div className="panel px-3 pt-4 pb-2 sm:px-5">
            <MonthlyRevenueChart
              currency={monthly.currency}
              months={monthly.months}
            />
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <div>
            <header className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-[16px] font-medium text-ink">Aging</h2>
              <p className="text-[12px] text-muted-foreground">
                Outstanding{" "}
                <span className="money text-negative">
                  {formatMoney(aging.totalOutstanding, aging.currency)}
                </span>
              </p>
            </header>
            <div className="panel px-3 pt-4 pb-2 sm:px-4">
              <AgingChart currency={aging.currency} buckets={aging.buckets} />
            </div>
          </div>

          <div>
            <header className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-[16px] font-medium text-ink">
                Najväčšie neuhradené
              </h2>
              <span className="text-[12px] text-faint">Top {top}</span>
            </header>
            <div className="panel overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[12px] text-muted-foreground">
                      Faktúra
                    </TableHead>
                    <TableHead className="text-right text-[12px] text-muted-foreground">
                      Suma
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aging.largestOutstanding.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Žiadne neuhradené
                      </TableCell>
                    </TableRow>
                  ) : (
                    aging.largestOutstanding.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Link
                            href={`/invoices/${row.id}`}
                            className="data-num font-medium hover:underline"
                          >
                            {row.number}
                          </Link>
                          <p className="text-[12px] text-muted-foreground">
                            {row.customerName}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="money">
                            {formatMoney(row.total, row.currency)}
                          </p>
                          <p className="text-[12px] text-negative">
                            {row.daysOverdue} d · {formatDate(row.dueDate)}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.12}>
        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <div>
            <header className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-[16px] font-medium text-ink">
                Top zákazníci
              </h2>
              <span className="text-[12px] text-faint">Obrat · top {top}</span>
            </header>
            <div className="panel px-3 pt-4 pb-2 sm:px-4">
              <TopCustomersChart
                currency={topCustomers.currency}
                customers={topCustomers.customers}
              />
            </div>
            {topCustomers.customers.length > 0 ? (
              <div className="mt-3 panel overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[12px] text-muted-foreground">
                        Zákazník
                      </TableHead>
                      <TableHead className="text-right text-[12px] text-muted-foreground">
                        Faktúry
                      </TableHead>
                      <TableHead className="text-right text-[12px] text-muted-foreground">
                        Obrat
                      </TableHead>
                      <TableHead className="text-right text-[12px] text-muted-foreground">
                        Podiel
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.customers.map((c) => (
                      <TableRow key={c.customerId}>
                        <TableCell>
                          <Link
                            href={`/customers/${c.customerId}`}
                            className="hover:underline"
                          >
                            {c.customerName}
                          </Link>
                        </TableCell>
                        <TableCell className="data-num text-right">
                          {c.invoiceCount}
                        </TableCell>
                        <TableCell className="money text-right">
                          {formatMoney(c.totalAmount, topCustomers.currency)}
                        </TableCell>
                        <TableCell className="data-num text-right text-muted-foreground">
                          {c.shareOfRevenuePercent.toFixed(1)} %
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div>
              <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[16px] font-medium text-ink">DPH podľa sadzby</h2>
                <div className="flex items-center gap-3">
                  <span className="money text-[12px] text-chart">
                    {formatMoney(vat.vatTotal, vat.currency)}
                  </span>
                  <a
                    href={vatExportHref({ from, to })}
                    download
                    className="text-[12px] font-medium text-ink underline-offset-2 hover:underline"
                  >
                    CSV
                  </a>
                </div>
              </header>
              <div className="panel px-3 pt-2 pb-3 sm:px-4">
                <VatChart currency={vat.currency} rows={vat.byRate} />
              </div>
              <div className="mt-3 panel grid divide-y divide-rule sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="px-4 py-3">
                  <p className="text-[12px] text-muted-foreground">Základ</p>
                  <p className="money mt-0.5 text-[16px] font-bold">
                    {formatMoney(vat.taxBaseTotal, vat.currency)}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[12px] text-muted-foreground">DPH</p>
                  <p className="money mt-0.5 text-[16px] font-bold text-chart">
                    {formatMoney(vat.vatTotal, vat.currency)}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[12px] text-muted-foreground">Spolu</p>
                  <p className="money mt-0.5 text-[16px] font-bold">
                    {formatMoney(vat.grossTotal, vat.currency)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-[16px] font-medium text-ink">
                Podľa stavu
              </h2>
              <div className="panel px-3 pt-2 pb-3 sm:px-4">
                <StatusChart
                  currency={overview.currency}
                  rows={overview.byStatus}
                />
              </div>
              <div className="mt-3 panel overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[12px] text-muted-foreground">
                        Stav
                      </TableHead>
                      <TableHead className="text-right text-[12px] text-muted-foreground">
                        Počet
                      </TableHead>
                      <TableHead className="text-right text-[12px] text-muted-foreground">
                        Suma
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.byStatus.map((row) => (
                      <TableRow key={row.status}>
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="data-num text-right">
                          {row.count}
                        </TableCell>
                        <TableCell className="money text-right">
                          {formatMoney(row.amount, overview.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}

