import Link from "next/link";
import { Download } from "lucide-react";
import { listInvoices } from "@/actions/invoices";
import { PageHeader } from "@/components/layout/page-header";
import { CsvPreview } from "@/components/preview/csv-preview";
import { DebouncedSearchField } from "@/components/shared/debounced-search-field";
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
import type { InvoiceDocumentType, InvoiceStatus } from "@/lib/api/types";
import { invoicesExportHref } from "@/lib/exports";
import {
  documentTypeLabel,
  formatDate,
  formatMoney,
  statusLabel,
} from "@/lib/format";
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

const documentTypes: (InvoiceDocumentType | "all")[] = [
  "all",
  "Invoice",
  "Proforma",
  "CreditNote",
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    type?: string;
    q?: string;
    page?: string;
    overdue?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const status =
    sp.status && sp.status !== "all" ? (sp.status as InvoiceStatus) : undefined;
  const documentType =
    sp.type && sp.type !== "all"
      ? (sp.type as InvoiceDocumentType)
      : undefined;
  const search = sp.q?.trim() || undefined;
  const overdueOnly = sp.overdue === "1";

  const data = await listInvoices({
    page,
    pageSize: 25,
    status,
    documentType,
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
          <div className="flex flex-wrap items-center gap-2">
            <CsvPreview
              href={invoicesExportHref({ status })}
              title="Náhľad — faktúry CSV"
              description={
                status
                  ? `Export filtrovaný podľa stavu ${status}.`
                  : "Všetky faktúry v CSV (oddeľovač ;)."
              }
            />
            <Button asChild variant="ghost" size="sm">
              <a href={invoicesExportHref({ status })} download>
                <Download className="size-3.5" aria-hidden />
                Stiahnuť
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/invoices/new?type=Proforma">Zálohová</Link>
            </Button>
            <Button asChild>
              <Link href="/invoices/new">Nová faktúra</Link>
            </Button>
          </div>
        }
      />

      <div className="mb-2 flex flex-wrap items-center gap-1">
        {documentTypes.map((t) => {
          const href =
            t === "all"
              ? `/invoices${status ? `?status=${status}` : ""}${overdueOnly ? `${status ? "&" : "?"}overdue=1` : ""}`
              : `/invoices?type=${t}${status ? `&status=${status}` : ""}${overdueOnly ? "&overdue=1" : ""}`;
          const active = (t === "all" && !documentType) || documentType === t;
          return (
            <Link
              key={t}
              href={href}
              className={cn(
                "rounded-[4px] px-2 py-1 text-[12px] font-medium",
                active
                  ? "bg-ink text-surface"
                  : "text-muted-foreground hover:bg-raised hover:text-ink",
              )}
            >
              {t === "all" ? "Všetky typy" : documentTypeLabel(t)}
            </Link>
          );
        })}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-border pb-0">
        {statuses.map((s) => {
          const typeQs = documentType ? `&type=${documentType}` : "";
          const href =
            s === "all"
              ? `/invoices${documentType ? `?type=${documentType}` : ""}${overdueOnly ? `${documentType ? "&" : "?"}overdue=1` : ""}`
              : `/invoices?status=${s}${typeQs}${overdueOnly ? "&overdue=1" : ""}`;
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

      <DebouncedSearchField
        path="/invoices"
        initialQuery={search ?? ""}
        placeholder="Číslo, zákazník…"
        extraParams={{
          status,
          type: documentType,
          overdue: overdueOnly ? "1" : undefined,
        }}
      />

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
                  Typ
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
                  <TableCell className="text-[12px] text-muted-foreground">
                    {documentTypeLabel(inv.documentType)}
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
