"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { VirtualList } from "@/shared/ui/virtual-list";
import { parseCsv, type CsvTable } from "@/shared/lib/preview/parse-csv";
import { cn } from "@/shared/lib/utils";

const DEFAULT_MAX_ROWS = 200;

function looksNumeric(value: string) {
  if (!value) return false;
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(cleaned);
}

export function useCsvTable(text: string, maxRows = DEFAULT_MAX_ROWS): CsvTable {
  return useMemo(() => {
    if (!text.trim()) return { headers: [], rows: [] };
    return parseCsv(text, maxRows);
  }, [text, maxRows]);
}

type CsvSheetProps = {
  table: CsvTable;
  /** Total data rows in source (before maxRows trim). */
  totalRows?: number;
  maxHeight?: string;
  className?: string;
  emptyLabel?: string;
};

/**
 * Ledger-style CSV sheet: sticky header, virtualized rows, mono cells.
 */
export function CsvSheet({
  table,
  totalRows,
  maxHeight = "min(42vh, 360px)",
  className,
  emptyLabel,
}: CsvSheetProps) {
  const t = useTranslations("CsvViewer");
  const colCount = Math.max(table.headers.length, 1);
  const truncated =
    totalRows != null && totalRows > table.rows.length && table.rows.length > 0;

  if (table.headers.length === 0 && table.rows.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
        {emptyLabel ?? t("empty")}
      </p>
    );
  }

  const columns = `2.75rem repeat(${colCount}, minmax(6.5rem, 1fr))`;

  return (
    <div
      className={cn(
        "csv-sheet overflow-hidden rounded-[6px] border border-border bg-surface",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div
            className="sticky top-0 z-10 grid border-b border-rule bg-raised/80 backdrop-blur-[2px]"
            style={{ gridTemplateColumns: columns }}
          >
            <div
              className="border-r border-rule/70 px-2 py-2.5 text-center font-mono text-[10px] tracking-wide text-faint uppercase"
              aria-hidden
            >
              #
            </div>
            {table.headers.map((h, i) => (
              <div
                key={`${h}-${i}`}
                className={cn(
                  "border-r border-rule/50 px-3 py-2.5 last:border-r-0",
                  "text-[11px] font-medium tracking-[0.04em] text-muted-foreground uppercase",
                )}
                title={h || t("col", { n: i + 1 })}
              >
                <span className="block truncate">
                  {h || t("col", { n: i + 1 })}
                </span>
              </div>
            ))}
          </div>

          <VirtualList
            items={table.rows}
            estimateSize={34}
            maxHeight={maxHeight}
            getItemKey={(_, i) => i}
            renderItem={(row, index) => (
              <div
                className={cn(
                  "grid border-b border-rule/60 transition-colors last:border-b-0",
                  "hover:bg-ink/[0.03] dark:hover:bg-ink/[0.06]",
                  index % 2 === 1 && "bg-raised/25",
                )}
                style={{ gridTemplateColumns: columns }}
              >
                <div className="border-r border-rule/70 px-2 py-1.5 text-center font-mono text-[10px] text-faint tabular-nums">
                  {index + 1}
                </div>
                {table.headers.map((_, ci) => {
                  const cell = row[ci] ?? "";
                  const numeric = looksNumeric(cell);
                  return (
                    <div
                      key={ci}
                      className={cn(
                        "max-w-[16rem] truncate border-r border-rule/40 px-3 py-1.5 last:border-r-0",
                        "font-mono text-[12px] text-ink",
                        numeric && "text-right tabular-nums",
                      )}
                      title={cell}
                    >
                      {cell || (
                        <span className="text-faint/70">·</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule bg-raised/30 px-3 py-2">
        <p className="font-mono text-[11px] text-faint tabular-nums">
          {t("meta", {
            cols: table.headers.length,
            rows: table.rows.length,
          })}
          {truncated ? "+" : ""}
        </p>
        {truncated ? (
          <p className="text-[11px] text-muted-foreground">
            {t("truncated", { shown: table.rows.length, total: totalRows })}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function countCsvDataRows(text: string): number {
  const raw = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = raw.split("\n").filter((l) => l.length > 0);
  return Math.max(0, lines.length - 1);
}
