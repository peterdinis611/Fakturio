"use client";

import { useEffect, useState } from "react";
import { Braces, FileSpreadsheet, Table2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  countCsvDataRows,
  CsvSheet,
  useCsvTable,
} from "@/widgets/preview/csv-sheet";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";

type CsvEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  fileName?: string | null;
  title?: string;
  description?: string;
};

/**
 * Full-screen-ish dialog: ledger table view + raw text editor for CSV paste/edit.
 */
export function CsvEditorDialog({
  open,
  onOpenChange,
  value,
  onChange,
  fileName,
  title,
  description,
}: CsvEditorDialogProps) {
  const t = useTranslations("CsvViewer");
  const tc = useTranslations("Common");
  const [draft, setDraft] = useState(value);
  const [mode, setMode] = useState<"table" | "raw">("table");

  useEffect(() => {
    if (open) {
      setDraft(value);
      setMode(value.trim() ? "table" : "raw");
    }
  }, [open, value]);

  const sheet = useCsvTable(draft, 250);
  const totalRows = draft.trim() ? countCsvDataRows(draft) : 0;

  function apply() {
    onChange(draft);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(92vh,820px)] w-[min(96vw,64rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
        showCloseButton
      >
        <DialogHeader className="gap-1 border-b border-rule px-5 py-4">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[5px] border border-border bg-raised/60 text-ink"
              aria-hidden
            >
              <FileSpreadsheet className="size-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-[16px]">
                {title ?? t("editorTitle")}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {description ??
                  (fileName
                    ? t("editorFile", { name: fileName })
                    : t("editorHint"))}
              </DialogDescription>
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
          {draft.trim() ? (
            <span className="font-mono text-[11px] text-faint tabular-nums">
              {t("meta", {
                cols: sheet.headers.length,
                rows: Math.min(sheet.rows.length, totalRows),
              })}
              {totalRows > sheet.rows.length ? "+" : ""}
            </span>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {mode === "table" ? (
            draft.trim() ? (
              <CsvSheet
                table={sheet}
                totalRows={totalRows}
                maxHeight="min(58vh, 520px)"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-[6px] border border-dashed border-border px-6 py-16 text-center">
                <p className="text-[14px] text-muted-foreground">{t("empty")}</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setMode("raw")}
                >
                  {t("editRaw")}
                </Button>
              </div>
            )
          ) : (
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={18}
              spellCheck={false}
              className="min-h-[min(58vh,520px)] resize-y font-mono text-[12px] leading-5"
              placeholder={t("pastePlaceholder")}
              autoFocus
            />
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-rule bg-raised/25 px-5 py-3 sm:justify-between">
          <p className="hidden text-[12px] text-muted-foreground sm:block">
            {t("editorFooter")}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              {tc("cancel")}
            </Button>
            <Button type="button" onClick={apply}>
              {t("apply")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
