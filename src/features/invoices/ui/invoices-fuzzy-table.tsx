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
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useFuzzySearch } from "@/shared/hooks/use-fuzzy-search";
import { fuzzyKeys } from "@/shared/lib/fuzzy-search";
import {
  documentTypeLabel,
  formatDate,
  formatMoney,
  statusLabelFor,
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
import { Button } from "@/shared/ui/button";
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
import { DataTableFacetFilter } from "@/shared/ui/data-table/facet-filter";
import { DataTablePagination } from "@/shared/ui/data-table/pagination";
import { DataTableViewOptions } from "@/shared/ui/data-table/view-options";

const STATUSES: InvoiceStatus[] = [
  "Draft",
  "Issued",
  "Paid",
  "Overdue",
  "Cancelled",
];

const DOC_TYPES: InvoiceDocumentType[] = [
  "Invoice",
  "Proforma",
  "CreditNote",
  "Quote",
  "DeliveryNote",
  "SalesOrder",
];

type Props = {
  items: InvoiceListItem[];
  initialQuery?: string;
  status?: InvoiceStatus;
  documentType?: InvoiceDocumentType;
  overdueOnly?: boolean;
  truncated?: boolean;
  canCreate?: boolean;
  newHref?: string;
};

export function InvoicesFuzzyTable({
  items,
  initialQuery = "",
  status,
  documentType,
  overdueOnly = false,
  truncated = false,
  canCreate = true,
  newHref = "/invoices/new",
}: Props) {
  const t = useTranslations("Invoices");
  const td = useTranslations("DataTable");
  const tc = useTranslations("Common");
  const locale = useLocale() as AppLocale;
  const [query, setQuery] = useState(initialQuery);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "issueDate", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const fuzzyItems = useFuzzySearch(items, query, {
    keys: fuzzyKeys.invoice,
    threshold: 0.36,
  });

  const searchPath = newHref.startsWith("/expenses")
    ? "/expenses"
    : "/invoices";

  const statusOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const inv of fuzzyItems) {
      counts.set(inv.status, (counts.get(inv.status) ?? 0) + 1);
    }
    return STATUSES.filter((s) => counts.has(s)).map((s) => ({
      value: s,
      label: statusLabelFor(s, locale),
      count: counts.get(s),
    }));
  }, [fuzzyItems, locale]);

  const typeOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const inv of fuzzyItems) {
      counts.set(inv.documentType, (counts.get(inv.documentType) ?? 0) + 1);
    }
    return DOC_TYPES.filter((d) => counts.has(d)).map((d) => ({
      value: d,
      label: documentTypeLabel(d, locale),
      count: counts.get(d),
    }));
  }, [fuzzyItems, locale]);

  const columns = useMemo<ColumnDef<InvoiceListItem>[]>(
    () => [
      {
        id: "select",
        enableHiding: false,
        enableSorting: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label={td("selectAll")}
            className="size-3.5 accent-[var(--ink)]"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) {
                el.indeterminate =
                  table.getIsSomePageRowsSelected() &&
                  !table.getIsAllPageRowsSelected();
              }
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={td("selectRow")}
            className="size-3.5 accent-[var(--ink)]"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        accessorKey: "number",
        meta: { label: t("colNumber") },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("colNumber")} />
        ),
        cell: ({ row }) => (
          <Link
            href={`/invoices/${row.original.id}`}
            className="data-num text-[14px] font-medium hover:underline"
          >
            {row.original.number}
          </Link>
        ),
      },
      {
        accessorKey: "documentType",
        meta: { label: t("colType") },
        filterFn: (row, id, value: string[]) => {
          if (!value?.length) return true;
          return value.includes(row.getValue(id));
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("colType")} />
        ),
        cell: ({ row }) => (
          <span className="text-[12px] text-muted-foreground">
            {documentTypeLabel(row.original.documentType, locale)}
          </span>
        ),
      },
      {
        accessorKey: "customerName",
        meta: { label: t("colCustomer") },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("colCustomer")} />
        ),
        cell: ({ row }) => (
          <span className="text-[14px]">{row.original.customerName}</span>
        ),
        filterFn: (row, id, value: string) => {
          if (!value?.trim()) return true;
          return String(row.getValue(id))
            .toLowerCase()
            .includes(value.trim().toLowerCase());
        },
      },
      {
        accessorKey: "status",
        meta: { label: t("colStatus") },
        filterFn: (row, id, value: string[]) => {
          if (!value?.length) return true;
          return value.includes(row.getValue(id));
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("colStatus")} />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "issueDate",
        meta: { label: t("colIssued") },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("colIssued")} />
        ),
        cell: ({ row }) => (
          <span className="text-[14px] text-muted-foreground">
            {formatDate(row.original.issueDate, locale)}
          </span>
        ),
      },
      {
        accessorKey: "dueDate",
        meta: { label: t("colDue") },
        filterFn: (row, _id, value: string) => {
          if (value !== "overdue") return true;
          return row.original.isOverdue;
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("colDue")} />
        ),
        cell: ({ row }) => (
          <span
            className={cn(
              "text-[14px]",
              row.original.isOverdue
                ? "text-negative"
                : "text-muted-foreground",
            )}
          >
            {formatDate(row.original.dueDate, locale)}
          </span>
        ),
      },
      {
        accessorKey: "total",
        meta: { label: t("colAmount") },
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t("colAmount")}
            align="right"
          />
        ),
        cell: ({ row }) => (
          <span className="money block text-right text-[14px]">
            {formatMoney(row.original.total, row.original.currency, locale)}
          </span>
        ),
      },
    ],
    [locale, t, td],
  );

  const table = useReactTable({
    data: fuzzyItems,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: { pageSize: 25 },
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
  });

  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as string[] | undefined) ?? [];
  const typeFilter =
    (table.getColumn("documentType")?.getFilterValue() as
      | string[]
      | undefined) ?? [];
  const customerFilter =
    (table.getColumn("customerName")?.getFilterValue() as string | undefined) ??
    "";
  const overdueFilter =
    table.getColumn("dueDate")?.getFilterValue() === "overdue";

  const filteredRows = table.getFilteredRowModel().rows;
  const filteredTotal = useMemo(
    () => filteredRows.reduce((sum, row) => sum + row.original.total, 0),
    [filteredRows],
  );
  const currency = filteredRows[0]?.original.currency ?? "EUR";

  const hasClientFilters =
    statusFilter.length > 0 ||
    typeFilter.length > 0 ||
    Boolean(customerFilter.trim()) ||
    overdueFilter ||
    Object.keys(columnVisibility).some(
      (k) => columnVisibility[k] === false,
    );

  function clearFilters() {
    setColumnFilters([]);
    setColumnVisibility({});
    setRowSelection({});
  }

  return (
    <>
      <FuzzySearchField
        path={searchPath}
        value={query}
        onValueChange={setQuery}
        placeholder={t("placeholder")}
        extraParams={{
          status,
          type: documentType,
          overdue: overdueOnly ? "1" : undefined,
        }}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {!status ? (
          <DataTableFacetFilter
            title={t("colStatus")}
            options={statusOptions}
            selected={new Set(statusFilter)}
            resetLabel={td("reset")}
            onChange={(next) =>
              table
                .getColumn("status")
                ?.setFilterValue(next.size ? [...next] : undefined)
            }
          />
        ) : null}
        {!documentType ? (
          <DataTableFacetFilter
            title={t("colType")}
            options={typeOptions}
            selected={new Set(typeFilter)}
            resetLabel={td("reset")}
            onChange={(next) =>
              table
                .getColumn("documentType")
                ?.setFilterValue(next.size ? [...next] : undefined)
            }
          />
        ) : null}
        <Input
          value={customerFilter}
          onChange={(e) =>
            table
              .getColumn("customerName")
              ?.setFilterValue(e.target.value || undefined)
          }
          placeholder={t("filterCustomer")}
          className="h-8 w-[11rem] text-[13px]"
        />
        {!overdueOnly ? (
          <Button
            type="button"
            size="sm"
            variant={overdueFilter ? "default" : "outline"}
            className="h-8"
            onClick={() =>
              table
                .getColumn("dueDate")
                ?.setFilterValue(overdueFilter ? undefined : "overdue")
            }
          >
            {statusLabelFor("Overdue", locale)}
          </Button>
        ) : null}
        {hasClientFilters ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={clearFilters}
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

      {filteredRows.length === 0 ? (
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
          actionLabel={
            query.trim() || hasClientFilters || !canCreate
              ? undefined
              : t("new")
          }
          actionHref={
            query.trim() || hasClientFilters || !canCreate
              ? undefined
              : newHref
          }
        />
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
                        header.column.id === "select" && "w-8 px-2",
                        header.column.id === "total" && "text-right",
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
                <TableRow
                  key={row.id}
                  className="h-11"
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === "select" && "w-8 px-2",
                      )}
                    >
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

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
            <p className="text-[12px] text-muted-foreground">
              {td("showing", {
                shown: table.getRowModel().rows.length,
                total: filteredRows.length,
              })}
              {" · "}
              <span className="tabular-nums text-ink">
                {formatMoney(filteredTotal, currency, locale)}
              </span>
            </p>
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
                selected: td("selected"),
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
