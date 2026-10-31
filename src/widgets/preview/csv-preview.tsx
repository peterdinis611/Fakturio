"use client";

import { Braces, Download, Eye, Table2 } from "lucide-react";
import {
  useEffect,
  useState,
  useTransition,
  type ComponentProps,
} from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Spinner } from "@/shared/ui/spinner";
import { parseCsv, type CsvTable } from "@/shared/lib/preview/parse-csv";
import {
  countCsvDataRows,
  CsvSheet,
} from "@/widgets/preview/csv-sheet";
import { cn } from "@/shared/lib/utils";

const PREVIEW_ROWS = 200;

export function CsvPreview({
  href,
  title,
  description,
  downloadHref,
  triggerLabel,
  triggerVariant = "outline",
  triggerSize = "sm",
}: {
  /** URL that returns CSV text (e.g. `/api/exports/invoices`). */
  href: string;
  title: string;
  description?: string;
  /** Optional separate download URL; defaults to `href`. */
  downloadHref?: string;
  triggerLabel?: string;
  triggerVariant?: ComponentProps<typeof Button>["variant"];
  triggerSize?: ComponentProps<typeof Button>["size"];
}) {
  const t = useTranslations("CsvViewer");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<string | null>(null);
  const [table, setTable] = useState<CsvTable | null>(null);
  const [mode, setMode] = useState<"table" | "raw">("table");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    startTransition(async () => {
      setError(null);
      setRaw(null);
      setTable(null);
      try {
        const res = await fetch(href, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (cancelled) return;
        setRaw(text);
        setTable(parseCsv(text, PREVIEW_ROWS));
      } catch {
        if (!cancelled) setError(t("loadError"));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, href, t]);

  const totalRows = raw != null ? countCsvDataRows(raw) : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={triggerVariant} size={triggerSize}>
          <Eye className="size-3.5" aria-hidden />
          {triggerLabel ?? t("open")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[min(90vh,760px)] w-[min(96vw,58rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
        showCloseButton
      >
        <DialogHeader className="gap-1 border-b border-rule px-5 py-4">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[4px] border border-border bg-raised/50 text-ink"
              aria-hidden
            >
              <Table2 className="size-3.5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-[16px]">{title}</DialogTitle>
              {description ? (
                <DialogDescription className="mt-1">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 border-b border-rule px-5 py-2.5">
          <div className="flex rounded-[4px] border border-border p-0.5">
            <button
              type="button"
              onClick={() => setMode("table")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-1 text-[12px] font-medium transition-colors",
                mode === "table"
                  ? "bg-ink text-primary-foreground"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              <Table2 className="size-3" aria-hidden />
              {t("table")}
            </button>
            <button
              type="button"
              onClick={() => setMode("raw")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-1 text-[12px] font-medium transition-colors",
                mode === "raw"
                  ? "bg-ink text-primary-foreground"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              <Braces className="size-3" aria-hidden />
              {t("raw")}
            </button>
          </div>
          <Button asChild size="sm" variant="outline" className="ml-auto">
            <a href={downloadHref ?? href} download>
              <Download className="size-3.5" aria-hidden />
              {t("download")}
            </a>
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {pending && !table && !error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Spinner size="lg" label={t("loading")} />
              <p className="text-[13px] text-muted-foreground">{t("loading")}</p>
            </div>
          ) : null}

          {error ? (
            <p className="px-5 py-10 text-center text-[14px] text-negative">
              {error}
            </p>
          ) : null}

          {!pending && !error && mode === "table" && table ? (
            <CsvSheet
              table={table}
              totalRows={totalRows}
              maxHeight="min(56vh, 460px)"
            />
          ) : null}

          {!pending && !error && mode === "raw" && raw != null ? (
            <pre className="overflow-auto rounded-[6px] border border-border bg-soft/50 px-4 py-3 font-mono text-[11px] leading-5 whitespace-pre-wrap text-ink">
              {raw.slice(0, 120_000)}
              {raw.length > 120_000 ? "\n…\n" : ""}
            </pre>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
