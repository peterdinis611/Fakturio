"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useFuzzySearch } from "@/shared/hooks/use-fuzzy-search";
import { fuzzyKeys } from "@/shared/lib/fuzzy-search";
import {
  documentTypeLabel,
  formatDate,
  formatMoney,
} from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type {
  InvoiceDocumentType,
  InvoiceListItem,
  InvoiceStatus,
} from "@/shared/api/types";
import type { AppLocale } from "@/i18n/routing";
import { EmptyState } from "@/shared/ui/empty-state";
import { FuzzySearchField } from "@/shared/ui/fuzzy-search-field";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

type Props = {
  items: InvoiceListItem[];
  initialQuery?: string;
  status?: InvoiceStatus;
  documentType?: InvoiceDocumentType;
  overdueOnly?: boolean;
  truncated?: boolean;
};

export function InvoicesFuzzyTable({
  items,
  initialQuery = "",
  status,
  documentType,
  overdueOnly = false,
  truncated = false,
}: Props) {
  const t = useTranslations("Invoices");
  const tc = useTranslations("Common");
  const locale = useLocale() as AppLocale;
  const [query, setQuery] = useState(initialQuery);
  const filtered = useFuzzySearch(items, query, {
    keys: fuzzyKeys.invoice,
    threshold: 0.36,
  });

  return (
    <>
      <FuzzySearchField
        path="/invoices"
        value={query}
        onValueChange={setQuery}
        placeholder={t("placeholder")}
        extraParams={{
          status,
          type: documentType,
          overdue: overdueOnly ? "1" : undefined,
        }}
      />

      {truncated ? (
        <p className="mb-3 text-[12px] text-muted-foreground">
          {t("fuzzyHint", { count: items.length })}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title={query.trim() ? tc("noMatches") : t("emptyTitle")}
          description={
            query.trim() ? tc("tryAnotherQuery") : t("emptyBody")
          }
          actionLabel={query.trim() ? undefined : t("new")}
          actionHref={query.trim() ? undefined : "/invoices/new"}
        />
      ) : (
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 text-[12px] font-medium text-muted-foreground">
                  {t("colNumber")}
                </TableHead>
                <TableHead className="h-10 text-[12px] font-medium text-muted-foreground">
                  {t("colType")}
                </TableHead>
                <TableHead className="h-10 text-[12px] font-medium text-muted-foreground">
                  {t("colCustomer")}
                </TableHead>
                <TableHead className="h-10 text-[12px] font-medium text-muted-foreground">
                  {t("colStatus")}
                </TableHead>
                <TableHead className="h-10 text-[12px] font-medium text-muted-foreground">
                  {t("colIssued")}
                </TableHead>
                <TableHead className="h-10 text-[12px] font-medium text-muted-foreground">
                  {t("colDue")}
                </TableHead>
                <TableHead className="h-10 text-right text-[12px] font-medium text-muted-foreground">
                  {t("colAmount")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
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
                    {documentTypeLabel(inv.documentType, locale)}
                  </TableCell>
                  <TableCell className="text-[14px]">{inv.customerName}</TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="text-[14px] text-muted-foreground">
                    {formatDate(inv.issueDate, locale)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-[14px]",
                      inv.isOverdue ? "text-negative" : "text-muted-foreground",
                    )}
                  >
                    {formatDate(inv.dueDate, locale)}
                  </TableCell>
                  <TableCell className="money text-right text-[14px]">
                    {formatMoney(inv.total, inv.currency, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
