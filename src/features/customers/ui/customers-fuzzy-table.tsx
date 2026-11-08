"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { CreateCustomerDialog } from "@/features/customers/ui/create-customer-dialog";
import { useFuzzySearch } from "@/shared/hooks/use-fuzzy-search";
import { fuzzyKeys } from "@/shared/lib/fuzzy-search";
import { emptyDash } from "@/shared/lib/format";
import type { Customer } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { FuzzySearchField } from "@/shared/ui/fuzzy-search-field";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { DataTableColumnHeader } from "@/shared/ui/data-table/column-header";
import { DataTablePagination } from "@/shared/ui/data-table/pagination";
import { DataTableViewOptions } from "@/shared/ui/data-table/view-options";
import { cn } from "@/shared/lib/utils";

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
  const td = useTranslations("DataTable");
  const tc = useTranslations("Common");
  const [query, setQuery] = useState(initialQuery);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const fuzzyItems = useFuzzySearch(items, query, {
    keys: fuzzyKeys.customer,
    threshold: 0.36,
  });

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: "name",
        meta: { label: t("colName") },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("colName")} />
        ),
        cell: ({ row }) => (
          <Link
            href={`/customers/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
        filterFn: (row, id, value: string) => {
          if (!value?.trim()) return true;
          return String(row.getValue(id))
            .toLowerCase()
            .includes(value.trim().toLowerCase());
        },
      },
      {
        accessorKey: "ico",
        meta: { label: t("colIco") },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("colIco")} />
        ),
        cell: ({ row }) => (
          <span className="data-num text-[13px]">
            {emptyDash(row.original.ico)}
          </span>
        ),
        filterFn: (row, id, value: string) => {
          if (!value?.trim()) return true;
          return String(row.getValue(id) ?? "")
            .toLowerCase()
            .includes(value.trim().toLowerCase());
        },
      },
      {
        accessorKey: "city",
        meta: { label: t("colCity") },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("colCity")} />
        ),
        cell: ({ row }) => emptyDash(row.original.city),
        filterFn: (row, id, value: string) => {
          if (!value?.trim()) return true;
          return String(row.getValue(id) ?? "")
            .toLowerCase()
            .includes(value.trim().toLowerCase());
        },
      },
      {
        accessorKey: "email",
        meta: { label: t("colEmail") },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("colEmail")} />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {emptyDash(row.original.email)}
          </span>
        ),
      },
      {
        accessorKey: "invoiceCount",
        meta: { label: t("colInvoices") },
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("colInvoices")}
            align="right"
          />
        ),
        cell: ({ row }) => (
          <span className="data-num block text-right">
            {row.original.invoiceCount}
          </span>
        ),
      },
    ],
    [t],
  );

  const table = useReactTable({
    data: fuzzyItems,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    initialState: { pagination: { pageSize: 25 } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
  });

  const nameFilter =
    (table.getColumn("name")?.getFilterValue() as string | undefined) ?? "";
  const icoFilter =
    (table.getColumn("ico")?.getFilterValue() as string | undefined) ?? "";
  const cityFilter =
    (table.getColumn("city")?.getFilterValue() as string | undefined) ?? "";

  const filteredCount = table.getFilteredRowModel().rows.length;
  const hasClientFilters = Boolean(
    nameFilter.trim() || icoFilter.trim() || cityFilter.trim(),
  );

  return (
    <>
      <FuzzySearchField
        path="/customers"
        value={query}
        onValueChange={setQuery}
        placeholder={t("placeholder")}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          value={nameFilter}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value || undefined)
          }
          placeholder={t("filterName")}
          className="h-8 w-[10rem] text-[13px]"
        />
        <Input
          value={icoFilter}
          onChange={(e) =>
            table.getColumn("ico")?.setFilterValue(e.target.value || undefined)
          }
          placeholder={t("filterIco")}
          className="h-8 w-[8rem] text-[13px]"
        />
        <Input
          value={cityFilter}
          onChange={(e) =>
            table.getColumn("city")?.setFilterValue(e.target.value || undefined)
          }
          placeholder={t("filterCity")}
          className="h-8 w-[8rem] text-[13px]"
        />
        {hasClientFilters ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={() => setColumnFilters([])}
          >
            <X className="size-3.5" aria-hidden />
            {td("clearFilters")}
          </Button>
        ) : null}
        <DataTableViewOptions
          table={table}
          label={td("columns")}
          columnsLabel={td("toggleColumns")}
        />
      </div>

      {truncated ? (
        <p className="mb-3 text-[12px] text-muted-foreground">
          {t("fuzzyHint", { count: items.length })}
        </p>
      ) : null}

      {filteredCount === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title={
              query.trim() || hasClientFilters
                ? tc("noMatches")
                : t("emptyTitle")
            }
            description={
              query.trim() || hasClientFilters
                ? tc("tryAnotherQuery")
                : t("emptyBody")
            }
          />
          {!query.trim() && !hasClientFilters ? (
            <CreateCustomerDialog
              trigger={<Button type="button">{t("add")}</Button>}
            />
          ) : null}
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-10",
                        header.column.id === "invoiceCount" && "text-right",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="h-11">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="border-t border-border px-3 py-2 text-[12px] text-muted-foreground">
            {td("showing", {
              shown: table.getRowModel().rows.length,
              total: filteredCount,
            })}
          </div>

          <div className="border-t border-border px-2">
            <DataTablePagination
              table={table}
              labels={{
                rowsPerPage: td("rowsPerPage"),
                pageOf: td("pageOf"),
                first: td("first"),
                previous: td("previous"),
                next: td("next"),
                last: td("last"),
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
