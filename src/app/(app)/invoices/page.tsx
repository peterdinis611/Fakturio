import Link from "next/link";
import { listInvoices } from "@/actions/invoices";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvoiceStatus } from "@/lib/api/types";
import { formatDate, formatMoney, statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Faktúry" };

const statuses: (InvoiceStatus | "all")[] = [
  "all",
  "Draft",
  "Issued",
  "Paid",
  "Overdue",
  "Cancelled",
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
    overdue?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const status =
    sp.status && sp.status !== "all" ? (sp.status as InvoiceStatus) : undefined;
  const search = sp.q?.trim() || undefined;
  const overdueOnly = sp.overdue === "1";

  const data = await listInvoices({
    page,
    pageSize: 25,
    status,
    search,
    overdueOnly,
  });

  return (
    <div>
      <PageHeader
        title="Faktúry"
        description={
          overdueOnly
            ? "Len po splatnosti: označiť úhradu alebo poslať upomienku."
            : "Koncept → vystavená → zaplatená. Číslo a VS sú v detaile."
        }
        actions={
          <Button asChild>
            <Link href="/invoices/new">Nová faktúra</Link>
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-border pb-0">
        {statuses.map((s) => {
          const href =
            s === "all"
              ? "/invoices"
              : `/invoices?status=${s}${overdueOnly ? "&overdue=1" : ""}`;
          const active = (s === "all" && !status) || status === s;
          return (
            <Link
              key={s}
              href={href}
              className={cn(
                "relative -mb-px border-b-2 px-2.5 py-2 text-[13px] font-medium",
                active
                  ? "border-ink text-ink"
                  : "border-transparent text-muted-foreground hover:text-ink",
              )}
            >
              {s === "all" ? "Všetky" : statusLabel[s]}
            </Link>
          );
        })}
        <div className="flex-1" />
        <Link
          href={overdueOnly ? "/invoices" : "/invoices?overdue=1"}
          className={cn(
            "mb-1 rounded-[6px] px-2 py-1 text-[12px] font-medium",
            overdueOnly
              ? "bg-pill-negative-bg text-pill-negative-ink"
              : "text-muted-foreground hover:bg-raised",
          )}
        >
          Po splatnosti
        </Link>
      </div>

      <form className="mb-4 flex max-w-sm gap-2" action="/invoices">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <input
          name="q"
          defaultValue={search}
          placeholder="Číslo, zákazník…"
          className="h-9 flex-1 rounded-[6px] border border-control bg-surface px-3 text-[14px] outline-none focus:ring-2 focus:ring-ink/15"
        />
        <Button type="submit" variant="secondary">
          Hľadať
        </Button>
      </form>

      {data.items.length === 0 ? (
        <EmptyState
          title="Žiadne faktúry"
          description="Vytvor koncept, pridaj položky a vystav."
          actionLabel="Nová faktúra"
          actionHref="/invoices/new"
        />
      ) : (
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 text-[12px] font-medium text-muted-foreground">
                  Číslo
                </TableHead>
                <TableHead className="h-10 text-[12px] font-medium text-muted-foreground">
                  Zákazník
                </TableHead>
                <TableHead className="h-10 text-[12px] font-medium text-muted-foreground">
                  Stav
                </TableHead>
                <TableHead className="h-10 text-[12px] font-medium text-muted-foreground">
                  Vystavené
                </TableHead>
                <TableHead className="h-10 text-[12px] font-medium text-muted-foreground">
                  Splatnosť
                </TableHead>
                <TableHead className="h-10 text-right text-[12px] font-medium text-muted-foreground">
                  Suma
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((inv) => (
                <TableRow key={inv.id} className="h-11">
                  <TableCell>
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="data-num text-[14px] font-medium hover:underline"
                    >
                      {inv.number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-[14px]">{inv.customerName}</TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="text-[14px] text-muted-foreground">
                    {formatDate(inv.issueDate)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-[14px]",
                      inv.isOverdue ? "text-negative" : "text-muted-foreground",
                    )}
                  >
                    {formatDate(inv.dueDate)}
                  </TableCell>
                  <TableCell className="money text-right text-[14px]">
                    {formatMoney(inv.total, inv.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data.totalPages > 1 ? (
        <p className="mt-3 text-[12px] text-muted-foreground">
          Strana {data.page} / {data.totalPages} · {data.totalCount} faktúr
        </p>
      ) : null}
    </div>
  );
}
