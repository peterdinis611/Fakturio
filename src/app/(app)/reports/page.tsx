import Link from "next/link";
import {
  getAgingReport,
  getMonthlyRevenue,
  getReportOverview,
  getTopCustomers,
  getVatReport,
} from "@/actions/reports";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney, statusLabel } from "@/lib/format";

export const metadata = { title: "Reporty" };

export default async function ReportsPage() {
  const year = new Date().getFullYear();
  const [overview, monthly, aging, top, vat] = await Promise.all([
    getReportOverview(),
    getMonthlyRevenue(year),
    getAgingReport(8),
    getTopCustomers({ limit: 8 }),
    getVatReport(),
  ]);

  const maxPaid = Math.max(...monthly.months.map((m) => m.paidAmount), 1);

  return (
    <div>
      <PageHeader
        title="Reporty"
        description={`K ${formatDate(overview.asOf)} · ${overview.currency}. Hlavný rad: zaplatené v ${monthly.year}.`}
      />

      <section className="mb-10">
        <div className="panel grid divide-y divide-rule sm:grid-cols-4 sm:divide-x sm:divide-y-0">
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
              chart: true,
            },
            {
              label: "Neuhradené",
              value: formatMoney(overview.outstandingAmount, overview.currency),
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
              <p className="text-[14px] text-muted-foreground">{k.label}</p>
              <p
                className={`money mt-1 text-[24px] leading-8 ${
                  k.bad
                    ? "text-negative"
                    : k.chart
                      ? "font-bold text-chart"
                      : "font-bold text-ink"
                }`}
              >
                {k.value}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">{k.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <header className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[16px] font-medium text-ink">
            Mesačné úhrady {monthly.year}
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Rok{" "}
            <span className="money text-ink">
              {formatMoney(monthly.yearPaidTotal, monthly.currency)}
            </span>
          </p>
        </header>
        <div className="panel space-y-2.5 px-5 py-4">
          {monthly.months.map((m) => (
            <div
              key={m.label}
              className="grid grid-cols-[3.5rem_1fr_6.5rem] items-center gap-3 text-[13px]"
            >
              <span className="text-muted-foreground">{m.label}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(m.paidAmount / maxPaid) * 100}%` }}
                />
              </div>
              <span className="money text-right text-ink">
                {formatMoney(m.paidAmount, monthly.currency)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-[16px] font-medium text-ink">Aging</h2>
          <p className="mb-3 text-[14px] text-muted-foreground">
            Outstanding{" "}
            <span className="money text-negative">
              {formatMoney(aging.totalOutstanding, aging.currency)}
            </span>
          </p>
          <div className="panel divide-y divide-rule">
            {aging.buckets.map((b) => (
              <div
                key={b.key}
                className="flex items-baseline justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-[14px] text-ink">{b.label}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {b.count} faktúr
                  </p>
                </div>
                <p className="money text-[14px]">
                  {formatMoney(b.amount, aging.currency)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-[16px] font-medium text-ink">
            Najväčšie neuhradené
          </h2>
          <div className="panel overflow-hidden">
            <Table>
              <TableBody>
                {aging.largestOutstanding.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-muted-foreground">
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
                          {row.daysOverdue} d
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

      <section className="mb-10">
        <h2 className="mb-3 text-[16px] font-medium text-ink">Top zákazníci</h2>
        <div className="panel overflow-hidden">
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
              {top.customers.map((c) => (
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
                    {formatMoney(c.totalAmount, top.currency)}
                  </TableCell>
                  <TableCell className="data-num text-right text-muted-foreground">
                    {c.shareOfRevenuePercent.toFixed(1)} %
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[16px] font-medium text-ink">DPH</h2>
        <div className="panel mb-4 grid divide-y divide-rule sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-4">
            <p className="text-[14px] text-muted-foreground">Základ</p>
            <p className="money mt-1 text-[24px] font-bold">
              {formatMoney(vat.taxBaseTotal, vat.currency)}
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[14px] text-muted-foreground">DPH</p>
            <p className="money mt-1 text-[24px] font-bold text-chart">
              {formatMoney(vat.vatTotal, vat.currency)}
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[14px] text-muted-foreground">Spolu</p>
            <p className="money mt-1 text-[24px] font-bold">
              {formatMoney(vat.grossTotal, vat.currency)}
            </p>
          </div>
        </div>
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[12px] text-muted-foreground">
                  Sadzba
                </TableHead>
                <TableHead className="text-right text-[12px] text-muted-foreground">
                  Základ
                </TableHead>
                <TableHead className="text-right text-[12px] text-muted-foreground">
                  DPH
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vat.byRate.map((row) => (
                <TableRow key={row.vatRate}>
                  <TableCell className="data-num">{row.vatRate} %</TableCell>
                  <TableCell className="money text-right">
                    {formatMoney(row.taxBase, vat.currency)}
                  </TableCell>
                  <TableCell className="money text-right">
                    {formatMoney(row.vatAmount, vat.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 panel overflow-hidden">
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
                    <span className="ml-2 text-[13px] text-muted-foreground">
                      {statusLabel[row.status]}
                    </span>
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
      </section>
    </div>
  );
}
