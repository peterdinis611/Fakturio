import Link from "next/link";
import {
  AlertTriangle,
  FileText,
  Files,
  ReceiptText,
  ScrollText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { InvoiceDocumentType, InvoiceStatus } from "@/lib/api/types";
import { documentTypeLabel, statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const statuses: (InvoiceStatus | "all")[] = [
  "all",
  "Draft",
  "Issued",
  "Paid",
  "Overdue",
  "Cancelled",
];

const documentTypes: {
  key: InvoiceDocumentType | "all";
  icon: typeof Files;
}[] = [
  { key: "all", icon: Files },
  { key: "Invoice", icon: FileText },
  { key: "Proforma", icon: ScrollText },
  { key: "CreditNote", icon: ReceiptText },
];

type InvoiceFiltersProps = {
  status?: InvoiceStatus;
  documentType?: InvoiceDocumentType;
  overdueOnly: boolean;
};

function buildHref({
  status,
  type,
  overdue,
}: {
  status?: InvoiceStatus;
  type?: InvoiceDocumentType;
  overdue?: boolean;
}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  if (overdue) params.set("overdue", "1");
  const qs = params.toString();
  return qs ? `/invoices?${qs}` : "/invoices";
}

export function InvoiceLifecycleHint({ overdueOnly }: { overdueOnly: boolean }) {
  if (overdueOnly) {
    return (
      <p className="text-[14px] text-muted-foreground">
        Len po splatnosti: označiť úhradu alebo poslať upomienku.
      </p>
    );
  }

  const steps = ["Koncept", "Vystavená", "Zaplatená"] as const;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
      {steps.map((step, i) => (
        <span key={step} className="inline-flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="rounded-[4px] border-border/80 bg-raised/40 px-1.5 py-0 text-[11px] font-medium text-ink"
          >
            {step}
          </Badge>
          {i < steps.length - 1 ? (
            <span className="text-faint" aria-hidden>
              →
            </span>
          ) : null}
        </span>
      ))}
      <span className="text-faint">·</span>
      <span>Číslo a VS sú v detaile.</span>
    </div>
  );
}

export function InvoiceFilters({
  status,
  documentType,
  overdueOnly,
}: InvoiceFiltersProps) {
  return (
    <div className="mb-4 space-y-3">
      <div
        role="tablist"
        aria-label="Typ dokladu"
        className="grid grid-cols-2 gap-1 rounded-[6px] border border-border bg-raised/35 p-1 sm:grid-cols-4"
      >
        {documentTypes.map(({ key, icon: Icon }) => {
          const active =
            (key === "all" && !documentType) || documentType === key;
          return (
            <Link
              key={key}
              href={buildHref({
                status,
                type: key === "all" ? undefined : key,
                overdue: overdueOnly,
              })}
              role="tab"
              aria-selected={active}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-[4px] px-2.5 py-2 text-[12px] font-medium transition-colors",
                active
                  ? "bg-ground text-ink shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:bg-surface/70 hover:text-ink",
              )}
            >
              <Icon className="size-3.5 opacity-70" aria-hidden />
              {key === "all" ? "Všetky" : documentTypeLabel(key)}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label="Stav"
          className="flex min-w-0 flex-1 flex-wrap gap-1"
        >
          {statuses.map((s) => {
            const active = (s === "all" && !status) || status === s;
            return (
              <Link
                key={s}
                href={buildHref({
                  status: s === "all" ? undefined : s,
                  type: documentType,
                  overdue: overdueOnly,
                })}
                role="tab"
                aria-selected={active}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
                  active
                    ? "border-ink bg-ink text-ground"
                    : "border-border bg-surface text-muted-foreground hover:border-control hover:text-ink",
                )}
              >
                {s === "all" ? "Všetky stavy" : statusLabel[s]}
              </Link>
            );
          })}
        </div>

        <Link
          href={buildHref({
            status,
            type: documentType,
            overdue: !overdueOnly,
          })}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
            overdueOnly
              ? "border-negative/40 bg-negative/10 text-negative"
              : "border-border bg-surface text-muted-foreground hover:border-control hover:text-ink",
          )}
        >
          <AlertTriangle className="size-3.5" aria-hidden />
          Po splatnosti
        </Link>
      </div>
    </div>
  );
}
