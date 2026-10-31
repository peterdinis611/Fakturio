"use client";

import { useMemo, useState, useTransition } from "react";
import { FileSpreadsheet, PencilLine } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "@/shared/toast";
import {
  confirmPaymentImportAction,
  previewPaymentImportAction,
} from "@/features/payments/api/payments";
import { CsvUploader } from "@/features/payments/ui/csv-uploader";
import { CsvEditorDialog } from "@/widgets/preview/csv-editor-dialog";
import { countCsvDataRows } from "@/widgets/preview/csv-sheet";
import { VirtualList } from "@/shared/ui/virtual-list";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type {
  PaymentImportPreviewResponse,
  PaymentImportRowResult,
} from "@/shared/api/types";
import { formatMoney } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { AppLocale } from "@/i18n/routing";

export function PaymentImportPanel() {
  const t = useTranslations("Payments");
  const tv = useTranslations("CsvViewer");
  const tc = useTranslations("Common");
  const locale = useLocale() as AppLocale;
  const [pending, startTransition] = useTransition();
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [preview, setPreview] = useState<PaymentImportPreviewResponse | null>(
    null,
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rowCount = useMemo(
    () => (csvText.trim() ? countCsvDataRows(csvText) : 0),
    [csvText],
  );
  const hasCsv = Boolean(csvText.trim());

  const statusLabel: Record<PaymentImportRowResult["matchStatus"], string> = {
    matched: t("matched"),
    ambiguous: t("ambiguous"),
    unmatched: t("noInvoice"),
    already_paid: t("alreadyPaid"),
    skipped: t("skipped"),
  };

  const matchedRows = useMemo(
    () =>
      preview?.rows.filter(
        (r) => r.matchStatus === "matched" && r.invoiceId,
      ) ?? [],
    [preview],
  );

  function runPreview() {
    startTransition(async () => {
      const result = await previewPaymentImportAction({ csvText });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("previewFailed"));
        return;
      }
      setPreview(result.data);
      const ids = new Set(
        result.data.rows
          .filter((r) => r.matchStatus === "matched" && r.invoiceId)
          .map((r) => r.invoiceId!),
      );
      setSelected(ids);
      toast.success(t("preview"));
    });
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirm() {
    const rows = matchedRows
      .filter((r) => r.invoiceId && selected.has(r.invoiceId))
      .map((r) => ({
        invoiceId: r.invoiceId!,
        paidAt: r.bookingDate,
      }));

    if (rows.length === 0) {
      toast.error(t("selectMatch"));
      return;
    }

    startTransition(async () => {
      const result = await confirmPaymentImportAction({ rows });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("previewFailed"));
        return;
      }
      toast.success(t("importDone"));
      setPreview(null);
      setSelected(new Set());
      setCsvText("");
      setFileName(null);
    });
  }

  function onFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result ?? ""));
      setFileName(file.name);
      setPreview(null);
      setEditorOpen(true);
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card size="sm" className="rounded-[6px] bg-surface ring-border">
        <CardHeader className="border-b border-rule pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-[15px]">{t("bankCsv")}</CardTitle>
              <CardDescription className="mt-1 max-w-xl">
                {t("description")}
              </CardDescription>
            </div>
            <Badge variant="outline" className="rounded-[4px] text-[10px]">
              {t("vsBadge")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label>{t("fileLabel")}</Label>
            <CsvUploader
              disabled={pending}
              fileName={fileName}
              onFile={onFile}
              onClear={() => {
                setFileName(null);
                setCsvText("");
                setPreview(null);
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-[11px] font-medium tracking-[0.08em] text-faint uppercase">
              {t("or")}
            </span>
            <Separator className="flex-1" />
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={() => setEditorOpen(true)}
            className={cn(
              "group flex w-full items-center gap-3 rounded-[6px] border border-dashed px-4 py-3.5 text-left transition-colors",
              "hover:border-control hover:bg-raised/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20",
              hasCsv ? "border-border bg-surface" : "border-border bg-ground/40",
              pending && "pointer-events-none opacity-50",
            )}
          >
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-[5px] border transition-colors",
                hasCsv
                  ? "border-ink/20 bg-ink text-primary-foreground"
                  : "border-border bg-raised/50 text-muted-foreground group-hover:border-control group-hover:text-ink",
              )}
              aria-hidden
            >
              {hasCsv ? (
                <FileSpreadsheet className="size-4" strokeWidth={1.75} />
              ) : (
                <PencilLine className="size-4" strokeWidth={1.75} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium text-ink">
                {hasCsv ? tv("changeCsv") : t("pasteShort")}
              </span>
              <span className="mt-0.5 block text-[12px] text-muted-foreground">
                {hasCsv
                  ? tv("hasData", { rows: rowCount })
                  : t("pasteLabel")}
              </span>
            </span>
            <Badge
              variant="secondary"
              className="shrink-0 rounded-[4px] text-[10px]"
            >
              {t("openCsvEditor")}
            </Badge>
          </button>
        </CardContent>

        <CardFooter className="justify-end border-t border-rule bg-raised/20">
          <Button
            type="button"
            disabled={pending || !hasCsv}
            onClick={runPreview}
          >
            {t("preview")}
          </Button>
        </CardFooter>
      </Card>

      <CsvEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        value={csvText}
        fileName={fileName}
        onChange={(next) => {
          setCsvText(next);
          setPreview(null);
          if (!next.trim()) setFileName(null);
        }}
      />

      {preview ? (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="rounded-[4px] data-num">
              {t("rowsBadge", { count: preview.totalRows })}
            </Badge>
            <Badge variant="outline" className="rounded-[4px] data-num">
              {t("matched")} {preview.matched}
            </Badge>
            <Badge variant="outline" className="rounded-[4px] data-num">
              {t("ambiguous")} {preview.ambiguous}
            </Badge>
            <Badge variant="outline" className="rounded-[4px] data-num">
              {t("noInvoice")} {preview.unmatched}
            </Badge>
            <Badge variant="outline" className="rounded-[4px] data-num">
              {t("alreadyPaid")} {preview.alreadyPaid}
            </Badge>
          </div>

          <div className="panel overflow-hidden">
            <div className="grid grid-cols-[2rem_2.5rem_minmax(5rem,1fr)_minmax(5rem,1fr)_minmax(5rem,1fr)_minmax(5rem,1fr)_minmax(6rem,1.4fr)] gap-2 border-b border-border px-3 py-2 text-[12px] text-muted-foreground">
              <span />
              <span>#</span>
              <span>{t("colVs")}</span>
              <span>{t("colAmount")}</span>
              <span>{t("colInvoice")}</span>
              <span>{t("colStatus")}</span>
              <span>{t("colNote")}</span>
            </div>
            <VirtualList
              items={preview.rows}
              estimateSize={44}
              maxHeight="22rem"
              getItemKey={(row) =>
                `${row.lineNumber}-${row.normalizedVariableSymbol ?? ""}`
              }
              renderItem={(row) => {
                const canSelect =
                  row.matchStatus === "matched" && Boolean(row.invoiceId);
                const checked =
                  canSelect && row.invoiceId
                    ? selected.has(row.invoiceId)
                    : false;
                return (
                  <div className="grid grid-cols-[2rem_2.5rem_minmax(5rem,1fr)_minmax(5rem,1fr)_minmax(5rem,1fr)_minmax(5rem,1fr)_minmax(6rem,1.4fr)] items-center gap-2 border-b border-border/80 px-3 py-2.5 text-[13px]">
                    <span>
                      {canSelect ? (
                        <Checkbox
                          checked={checked}
                          disabled={pending}
                          onCheckedChange={() => toggle(row.invoiceId!)}
                          aria-label={t("selectInvoice", {
                            number: row.invoiceNumber ?? "",
                          })}
                        />
                      ) : null}
                    </span>
                    <span className="data-num">{row.lineNumber}</span>
                    <span className="data-num">
                      {row.normalizedVariableSymbol ?? "—"}
                    </span>
                    <span className="data-num">
                      {row.amount != null
                        ? formatMoney(
                            row.amount,
                            row.invoiceCurrency ?? "EUR",
                            locale,
                          )
                        : "—"}
                    </span>
                    <span className="font-medium">
                      {row.invoiceNumber ?? "—"}
                    </span>
                    <span
                      className={cn(
                        "text-[12px]",
                        row.matchStatus === "matched" && "text-ink",
                        row.matchStatus === "unmatched" &&
                          "text-muted-foreground",
                        row.matchStatus === "ambiguous" && "text-signal",
                        row.matchStatus === "already_paid" &&
                          "text-muted-foreground",
                      )}
                    >
                      {statusLabel[row.matchStatus]}
                    </span>
                    <span className="truncate text-[12px] text-muted-foreground">
                      {row.message ?? row.counterparty ?? "—"}
                    </span>
                  </div>
                );
              }}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setPreview(null);
                setSelected(new Set());
              }}
            >
              {tc("cancel")}
            </Button>
            <Button
              type="button"
              disabled={pending || selected.size === 0}
              onClick={confirm}
            >
              {t("markPaid", { count: selected.size })}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
