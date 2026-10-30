"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateCustomerDialog } from "@/features/customers/ui/create-customer-dialog";
import { useFuzzySearch } from "@/shared/hooks/use-fuzzy-search";
import { fuzzyKeys } from "@/shared/lib/fuzzy-search";
import { emptyDash } from "@/shared/lib/format";
import type { Customer } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { FuzzySearchField } from "@/shared/ui/fuzzy-search-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

type Props = {
  items: Customer[];
  initialQuery?: string;
  truncated?: boolean;
};

export function CustomersFuzzyTable({
  items,
  initialQuery = "",
  truncated = false,
}: Props) {
  const t = useTranslations("Customers");
  const tc = useTranslations("Common");
  const [query, setQuery] = useState(initialQuery);
  const filtered = useFuzzySearch(items, query, {
    keys: fuzzyKeys.customer,
    threshold: 0.36,
  });

  return (
    <>
      <FuzzySearchField
        path="/customers"
        value={query}
        onValueChange={setQuery}
        placeholder={t("placeholder")}
      />

      {truncated ? (
        <p className="mb-3 text-[12px] text-muted-foreground">
          {t("fuzzyHint", { count: items.length })}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title={query.trim() ? tc("noMatches") : t("emptyTitle")}
            description={
              query.trim() ? tc("tryAnotherQuery") : t("emptyBody")
            }
          />
          {!query.trim() ? (
            <CreateCustomerDialog
              trigger={<Button type="button">{t("add")}</Button>}
            />
          ) : null}
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[12px] text-muted-foreground">
                  {t("colName")}
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  {t("colIco")}
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  {t("colCity")}
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  {t("colEmail")}
                </TableHead>
                <TableHead className="text-right text-[12px] text-muted-foreground">
                  {t("colInvoices")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="h-11">
                  <TableCell>
                    <Link
                      href={`/customers/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="data-num text-[13px]">
                    {emptyDash(c.ico)}
                  </TableCell>
                  <TableCell>{emptyDash(c.city)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {emptyDash(c.email)}
                  </TableCell>
                  <TableCell className="data-num text-right">
                    {c.invoiceCount}
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
