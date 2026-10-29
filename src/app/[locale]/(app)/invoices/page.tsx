import Link from "next/link";
import { Download } from "lucide-react";
import { listInvoices } from "@/features/invoices/api/invoices";
import {
  InvoiceFilters,
  InvoiceLifecycleHint,
} from "@/features/invoices/ui/invoice-filters";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { CsvPreview } from "@/widgets/preview/csv-preview";
import { DebouncedSearchField } from "@/shared/ui/debounced-search-field";
import { EmptyState } from "@/shared/ui/empty-state";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import type { InvoiceDocumentType, InvoiceStatus } from "@/shared/api/types";
import { invoicesExportHref } from "@/shared/lib/exports";
import {
  documentTypeLabel,
  formatDate,
  formatMoney,
} from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export const metadata = { title: "Faktúry" };

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
        description={<InvoiceLifecycleHint overdueOnly={overdueOnly} />}
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

      <InvoiceFilters
        status={status}
        documentType={documentType}
        overdueOnly={overdueOnly}
      />

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
