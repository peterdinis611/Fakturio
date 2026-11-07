import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/shared/ui/badge";
import type { InvoiceDocumentType, InvoiceStatus } from "@/shared/api/types";
import { statusLabelFor } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { AppLocale } from "@/i18n/routing";

const statuses: (InvoiceStatus | "all")[] = [
  "all",
  "Draft",
  "Issued",
  "Paid",
  "Overdue",
  "Cancelled",
];

type InvoiceFiltersProps = {
  status?: InvoiceStatus;
  documentType?: InvoiceDocumentType;
  overdueOnly: boolean;
  basePath?: "/invoices" | "/expenses";
};

function buildHref({
  status,
  type,
  overdue,
  basePath = "/invoices",
}: {
  status?: InvoiceStatus;
  type?: InvoiceDocumentType;
  overdue?: boolean;
  basePath?: string;
}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  if (overdue) params.set("overdue", "1");
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export async function InvoiceLifecycleHint({
  overdueOnly,
}: {
  overdueOnly: boolean;
}) {
  const t = await getTranslations("Invoices");
  const locale = (await getLocale()) as AppLocale;

  if (overdueOnly) {
    return (
      <p className="text-[14px] text-muted-foreground">{t("overdueOnlyHint")}</p>
    );
  }

  const steps = [
    statusLabelFor("Draft", locale),
    statusLabelFor("Issued", locale),
    statusLabelFor("Paid", locale),
  ] as const;

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
      <span>{t("lifecycleHint")}</span>
    </div>
  );
}

export async function InvoiceFilters({
  status,
  documentType,
  overdueOnly,
  basePath = "/invoices",
}: InvoiceFiltersProps) {
  const t = await getTranslations("Common");
  const ti = await getTranslations("Invoices");
  const locale = (await getLocale()) as AppLocale;
  const showOverdue = basePath === "/invoices";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div
        role="tablist"
        aria-label={ti("colStatus")}
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
                basePath,
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
              {s === "all" ? t("allStatuses") : statusLabelFor(s, locale)}
            </Link>
          );
        })}
      </div>

      {showOverdue ? (
        <Link
          href={buildHref({
            status,
            type: documentType,
            overdue: !overdueOnly,
            basePath,
          })}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
            overdueOnly
              ? "border-negative/40 bg-negative/10 text-negative"
              : "border-border bg-surface text-muted-foreground hover:border-control hover:text-ink",
          )}
        >
          <AlertTriangle className="size-3.5" aria-hidden />
          {statusLabelFor("Overdue", locale)}
        </Link>
      ) : null}
    </div>
  );
}
