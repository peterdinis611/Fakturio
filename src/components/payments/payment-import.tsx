"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "@/lib/toast";
import {
  confirmPaymentImportAction,
  previewPaymentImportAction,
} from "@/actions/payments";
import { VirtualList } from "@/components/shared/virtual-list";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
    });
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result ?? ""));
      setPreview(null);
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <section className="panel flex flex-col gap-4 p-4">
        <div>
          <h2 className="font-heading text-sm font-medium">Bankový CSV</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Export z banky (Tatra, SLSP, VÚB…). Hľadáme stĺpec VS / variabilný
            symbol a párme ho na vystavené faktúry.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="csv-file">Súbor</Label>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv,text/plain"
            className="text-[13px] text-muted-foreground file:mr-3 file:rounded-[4px] file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-[13px] file:text-ink"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="csv-text">Alebo vlož CSV</Label>
          <Textarea
            id="csv-text"
            rows={8}
            className="font-mono text-[12px]"
            placeholder={"Dátum;VS;Suma;Protistrana\n12.03.2026;20260001;120.00;Firma s.r.o."}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setPreview(null);
            }}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            disabled={pending || !csvText.trim()}
            onClick={runPreview}
          >
            Párovanie VS
          </Button>
        </div>
      </section>

      {preview ? (
        <section className="space-y-4">
          <div className="ledger-strip">
            <span>Riadky {preview.totalRows}</span>
            <span>Zhody {preview.matched}</span>
            <span>Nejednoznačné {preview.ambiguous}</span>
            <span>Bez faktúry {preview.unmatched}</span>
            <span>Už zaplatené {preview.alreadyPaid}</span>
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
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={pending}
                          onChange={() => toggle(row.invoiceId!)}
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
