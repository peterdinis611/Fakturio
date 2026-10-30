"use client";

import { FileSpreadsheet, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type CsvUploaderProps = {
  disabled?: boolean;
  fileName?: string | null;
  onFile: (file: File) => void;
  onClear?: () => void;
};

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function CsvUploader({
  disabled,
  fileName,
  onFile,
  onClear,
}: CsvUploaderProps) {
  const t = useTranslations("Payments");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [meta, setMeta] = useState<{ name: string; size: number } | null>(null);

  const displayName = fileName ?? meta?.name ?? null;

  function accept(file: File | undefined | null) {
    if (!file || disabled) return;
    setMeta({ name: file.name, size: file.size });
    onFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files?.[0]);
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[6px] border border-dashed px-4 py-7 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20",
          dragging
            ? "border-ink bg-raised/50"
            : "border-border bg-ground/50 hover:border-control hover:bg-raised/35",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span
          className={cn(
            "grid size-10 place-items-center rounded-[6px] border transition-colors",
            dragging
              ? "border-ink bg-ink text-ground"
              : "border-border bg-surface text-muted-foreground group-hover:border-control group-hover:text-ink",
          )}
          aria-hidden
        >
          <Upload className="size-4" strokeWidth={1.75} />
        </span>
        <div className="space-y-0.5">
          <p className="text-[13px] font-medium text-ink">{t("dropHint")}</p>
          <p className="text-[12px] text-muted-foreground">
            .csv · Tatra, SLSP, VÚB a pod.
          </p>
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".csv,text/csv,text/plain"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {displayName ? (
        <div className="flex items-center gap-2.5 rounded-[6px] border border-border bg-surface px-3 py-2">
          <span
            className="grid size-8 shrink-0 place-items-center rounded-[4px] border border-border bg-raised/50 text-ink"
            aria-hidden
          >
            <FileSpreadsheet className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">
              {displayName}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="secondary"
                className="rounded-[4px] text-[10px] uppercase"
              >
                CSV
              </Badge>
              {meta?.size != null ? (
                <span className="data-num text-[11px] text-muted-foreground">
                  {formatBytes(meta.size)}
                </span>
              ) : null}
            </div>
          </div>
          {onClear ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={disabled}
              aria-label={t("removeFile")}
              onClick={(e) => {
                e.stopPropagation();
                setMeta(null);
                onClear();
              }}
            >
              <X className="size-3.5" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
