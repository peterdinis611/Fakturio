"use client";

import { useState, type ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { AgingChart } from "@/features/reports/ui/aging-chart";
import { StatusChart } from "@/features/reports/ui/status-chart";
import { TopCustomersChart } from "@/features/reports/ui/top-customers-chart";
import { VatChart } from "@/features/reports/ui/vat-chart";
import type {
  AgingReport,
  ReportOverview,
  TopCustomersReport,
  VatReport,
} from "@/shared/api/types";
import { formatMoney, formatPercent } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import type { AppLocale } from "@/i18n/routing";

function ChartFrame({
  title,
  meta,
  description,
  expandLabel,
  compact,
  expanded,
  wide = false,
  className,
}: {
  title: string;
  meta: ReactNode;
  description: string;
  expandLabel: string;
  compact: ReactNode;
  expanded: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className={className}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-medium text-ink">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-ink"
            aria-label={expandLabel}
            title={expandLabel}
            onClick={() => setOpen(true)}
          >
            <Maximize2 />
          </Button>
        </div>
        <div className="text-[12px] text-muted-foreground">{meta}</div>
      </div>
      <div
        className="cursor-zoom-in border-t border-rule pt-3 transition-colors hover:border-chart"
        onClick={() => setOpen(true)}
        title={expandLabel}
      >
        {compact}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={wide ? "sm:max-w-5xl" : "sm:max-w-3xl"}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="border-t border-rule pt-3">
            {open ? expanded : null}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function DashboardCharts({
  overview,
  aging,
  topCustomers,
  vat,
}: {
  overview: ReportOverview;
  aging: AgingReport;
  topCustomers: TopCustomersReport;
  vat: VatReport;
}) {
  const t = useTranslations("Dashboard");
  const reports = useTranslations("Reports");
  const locale = useLocale() as AppLocale;
  const expandLabel = t("chartExpand");

  return (
    <div className="mb-10">
      <p className="mb-4 text-[11px] font-medium tracking-[0.14em] text-faint uppercase">
        {t("chartsTitle")}
      </p>
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-6">
        <ChartFrame
          className="xl:col-span-3"
          title={t("chartAging")}
          expandLabel={expandLabel}
          description={`${t("unpaid")} ${formatMoney(aging.totalOutstanding, aging.currency, locale)}`}
          meta={
            <span className="money text-negative">
              {formatMoney(aging.totalOutstanding, aging.currency, locale)}
            </span>
          }
          compact={
            <AgingChart
              currency={aging.currency}
              buckets={aging.buckets}
              className="h-[180px]"
            />
          }
          expanded={
            <AgingChart
              currency={aging.currency}
              buckets={aging.buckets}
              className="h-[min(58vh,420px)]"
            />
          }
        />

        <ChartFrame
          className="xl:col-span-3"
          title={t("chartStatus")}
          expandLabel={expandLabel}
          description={`${reports("invoices")} · ${formatPercent(overview.collectionRatePercent, locale)}`}
          meta={
            <span className="data-num">
              {formatPercent(overview.collectionRatePercent, locale)}
            </span>
          }
          compact={
            <StatusChart
              currency={overview.currency}
              rows={overview.byStatus}
              size="compact"
            />
          }
          expanded={
            <StatusChart
              currency={overview.currency}
              rows={overview.byStatus}
              size="large"
              className="h-[min(58vh,420px)]"
            />
          }
        />

        <ChartFrame
          wide
          className="sm:col-span-2 xl:col-span-4"
          title={t("chartCustomers")}
          expandLabel={expandLabel}
          description={`${reports("topCustomers")} · ${topCustomers.customers.length}`}
          meta={
            <span className="data-num text-faint">
              {topCustomers.customers.length}
            </span>
          }
          compact={
            <TopCustomersChart
              currency={topCustomers.currency}
              customers={topCustomers.customers}
              className="h-[180px]"
            />
          }
          expanded={
            <TopCustomersChart
              currency={topCustomers.currency}
              customers={topCustomers.customers}
              className="h-[min(58vh,420px)]"
            />
          }
        />

        <ChartFrame
          className="sm:col-span-2 xl:col-span-2"
          title={t("chartVat")}
          expandLabel={expandLabel}
          description={`${t("chartVat")} ${formatMoney(vat.vatTotal, vat.currency, locale)}`}
          meta={
            <span className="money text-chart">
              {formatMoney(vat.vatTotal, vat.currency, locale)}
            </span>
          }
          compact={
            <VatChart currency={vat.currency} rows={vat.byRate} size="compact" />
          }
          expanded={
            <VatChart
              currency={vat.currency}
              rows={vat.byRate}
              size="large"
              className="h-[min(58vh,420px)]"
            />
          }
        />
      </div>
    </div>
  );
}
