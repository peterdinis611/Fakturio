"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { formatMoney } from "@/shared/lib/format";
import { intlLocale } from "@/i18n/locales";
import type { AppLocale } from "@/i18n/routing";

export function CashflowTrend({
  currency,
  months,
  yearPaidTotal,
  yearIssuedTotal,
  year = new Date().getFullYear(),
  mode = "embed",
}: {
  currency: string;
  yearPaidTotal: number;
  yearIssuedTotal: number;
  year?: number;
  mode?: "embed" | "popout";
  months: {
    month: number;
    paidAmount: number;
    issuedAmount: number;
  }[];
}) {
  const t = useTranslations("Dashboard");
  const locale = useLocale() as AppLocale;
  const numberLocale = intlLocale(locale);
  const isPopout = mode === "popout";
  const [open, setOpen] = useState(false);

  const config = {
    paid: {
      label: t("cashflowCollected"),
      color: "var(--chart-3)",
    },
    issued: {
      label: t("cashflowIssued"),
      color: "var(--text)",
    },
  } satisfies ChartConfig;

  const data = months.map((m) => ({
    month: new Intl.DateTimeFormat(numberLocale, { month: "short" }).format(
      new Date(year, m.month - 1, 1),
    ),
    paid: m.paidAmount,
    issued: m.issuedAmount,
  }));

  function renderChart(large: boolean) {
    return (
      <ChartContainer
        config={config}
        className={
          large
            ? "aspect-auto h-[min(58vh,460px)] w-full"
            : "aspect-auto h-[200px] w-full"
        }
      >
        <AreaChart accessibilityLayer data={data} margin={{ left: 0, right: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--rule)" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fill: "var(--muted)", fontSize: 10 }}
            tickFormatter={(v) =>
              new Intl.NumberFormat(numberLocale, {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(Number(v))
            }
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <span className="money">
                    {formatMoney(Number(value), currency, locale)}
                    <span className="ml-1 text-muted-foreground">
                      {name === "paid"
                        ? t("cashflowCollected")
                        : t("cashflowIssued")}
                    </span>
                  </span>
                )}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="issued"
            stroke="var(--color-issued)"
            fill="var(--color-issued)"
            fillOpacity={0.08}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="paid"
            stroke="var(--color-paid)"
            fill="var(--color-paid)"
            fillOpacity={0.18}
            strokeWidth={1.75}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    );
  }

  const totals = (
    <div className="flex flex-wrap gap-4 text-[12px] text-muted-foreground">
      <span>
        {t("cashflowCollected")}{" "}
        <span className="money text-chart">
          {formatMoney(yearPaidTotal, currency, locale)}
        </span>
      </span>
      <span>
        {t("cashflowIssued")}{" "}
        <span className="money text-ink">
          {formatMoney(yearIssuedTotal, currency, locale)}
        </span>
      </span>
    </div>
  );

  return (
    <div className={isPopout ? "flex min-h-[min(70vh,560px)] flex-1 flex-col" : undefined}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-medium text-ink">
            {isPopout ? t("cashflowPopoutTitle") : "Cashflow"}
          </h2>
          {!isPopout ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-ink"
              aria-label={t("chartExpand")}
              title={t("chartExpand")}
              onClick={() => setOpen(true)}
            >
              <Maximize2 />
            </Button>
          ) : null}
        </div>
        {totals}
      </div>
      <div
        className={
          isPopout
            ? "flex min-h-0 flex-1 flex-col border-t border-rule pt-4"
            : "cursor-zoom-in border-t border-rule pt-3 transition-colors hover:border-chart"
        }
        onClick={isPopout ? undefined : () => setOpen(true)}
        title={isPopout ? undefined : t("chartExpand")}
      >
        {renderChart(isPopout)}
      </div>

      {isPopout ? null : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle>{t("cashflowPopoutTitle")}</DialogTitle>
              <DialogDescription className="text-[13px]">
                {t("cashflowCollected")}{" "}
                {formatMoney(yearPaidTotal, currency, locale)}
                {" · "}
                {t("cashflowIssued")}{" "}
                {formatMoney(yearIssuedTotal, currency, locale)}
              </DialogDescription>
            </DialogHeader>
            <div className="border-t border-rule pt-3">
              {open ? renderChart(true) : null}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
