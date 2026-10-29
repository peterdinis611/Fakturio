"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import {
  confirmPaymentImportAction,
  previewPaymentImportAction,
} from "@/actions/payments";
import { CsvUploader } from "@/components/payments/csv-uploader";
import { VirtualList } from "@/components/shared/virtual-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { actionErrorMessage } from "@/lib/action-utils";
import type {
  PaymentImportPreviewResponse,
  PaymentImportRowResult,
} from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusLabel: Record<PaymentImportRowResult["matchStatus"], string> = {
  matched: "Zhoda",
  ambiguous: "Nejednoznačné",
  unmatched: "Bez faktúry",
  already_paid: "Už zaplatené",
  skipped: "Preskočené",
};

export function PaymentImportPanel() {
  const [pending, startTransition] = useTransition();
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<PaymentImportPreviewResponse | null>(
    null,
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
        toast.error(actionErrorMessage(result ?? {}) ?? "Náhľad zlyhal");
        return;
      }
      setPreview(result.data);
      const ids = new Set(
        result.data.rows
          .filter((r) => r.matchStatus === "matched" && r.invoiceId)
          .map((r) => r.invoiceId!),
      );
      setSelected(ids);
      toast.success(
        `Nájdených ${result.data.matched} zhôd z ${result.data.totalRows} riadkov`,
      );
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
      toast.error("Vyber aspoň jednu zhodu");
      return;
    }

    startTransition(async () => {
      const result = await confirmPaymentImportAction({ rows });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Import zlyhal");
        return;
      }
      toast.success(
        `Označených ako zaplatené: ${result.data.markedPaid}` +
          (result.data.failed ? ` · zlyhalo ${result.data.failed}` : ""),
      );
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
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card size="sm" className="rounded-[6px] bg-surface ring-border">
        <CardHeader className="border-b border-rule pb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-[15px]">Bankový CSV</CardTitle>
              <CardDescription className="mt-1 max-w-xl">
                Export z banky (Tatra, SLSP, VÚB…). Hľadáme stĺpec VS /
                variabilný symbol a párme ho na vystavené faktúry.
              </CardDescription>
            </div>
            <Badge variant="outline" className="rounded-[4px] text-[10px]">
              VS párovanie
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label>Súbor</Label>
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
              alebo
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="csv-text">Vlož CSV text</Label>
            <Textarea
              id="csv-text"
              rows={7}
              className="font-mono text-[12px]"
              placeholder={
                "Dátum;VS;Suma;Protistrana\n12.03.2026;20260001;120.00;Firma s.r.o."
              }
              value={csvText}
              disabled={pending}
              onChange={(e) => {
                setCsvText(e.target.value);
                setFileName(null);
                setPreview(null);
              }}
            />
          </div>
        </CardContent>

        <CardFooter className="justify-end border-t border-rule bg-raised/20">
          <Button
            type="button"
            disabled={pending || !csvText.trim()}
            onClick={runPreview}
          >
            Párovanie VS
          </Button>
        </CardFooter>
      </Card>

      {preview ? (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="rounded-[4px] data-num">
              Riadky {preview.totalRows}
            </Badge>
            <Badge variant="outline" className="rounded-[4px] data-num">
              Zhody {preview.matched}
            </Badge>
            <Badge variant="outline" className="rounded-[4px] data-num">
              Nejednoznačné {preview.ambiguous}
            </Badge>
            <Badge variant="outline" className="rounded-[4px] data-num">
              Bez faktúry {preview.unmatched}
            </Badge>
            <Badge variant="outline" className="rounded-[4px] data-num">
              Už zaplatené {preview.alreadyPaid}
            </Badge>
          </div>

          <div className="panel overflow-hidden">
            <div className="grid grid-cols-[2rem_2.5rem_minmax(5rem,1fr)_minmax(5rem,1fr)_minmax(5rem,1fr)_minmax(5rem,1fr)_minmax(6rem,1.4fr)] gap-2 border-b border-border px-3 py-2 text-[12px] text-muted-foreground">
              <span />
              <span>#</span>
              <span>VS</span>
              <span>Suma</span>
              <span>Faktúra</span>
              <span>Stav</span>
              <span>Poznámka</span>
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
                          aria-label={`Vybrať ${row.invoiceNumber}`}
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
              Zrušiť
            </Button>
            <Button
              type="button"
              disabled={pending || selected.size === 0}
              onClick={confirm}
            >
              Označiť {selected.size} ako zaplatené
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
