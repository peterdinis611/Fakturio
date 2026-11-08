"use client";

import { useLocale, useTranslations } from "next-intl";
import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import { formatMoney } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { AppLocale } from "@/i18n/routing";

const palette = [
  "var(--chart-3)",
  "var(--text)",
  "var(--muted)",
  "var(--warning)",
  "var(--control)",
];

export function VatChart({
  currency,
  rows,
  className,
  size = "regular",
}: {
  currency: string;
  rows: { vatRate: number; vatAmount: number; taxBase: number }[];
  className?: string;
  size?: "compact" | "regular" | "large";
}) {
  const t = useTranslations("Reports");
  const locale = useLocale() as AppLocale;
  const config = Object.fromEntries(
    rows.map((r, i) => [
      `rate_${r.vatRate}`,
      {
        label: `${r.vatRate} %`,
        color: palette[i % palette.length],
      },
    ]),
  ) satisfies ChartConfig;

  const data = rows.map((r, i) => ({
    key: `rate_${r.vatRate}`,
    rate: r.vatRate,
    vat: r.vatAmount,
    taxBase: r.taxBase,
    fill: palette[i % palette.length],
  }));

  const height =
    size === "compact" ? "h-[180px]" : size === "large" ? "h-[380px]" : "h-[220px]";
  const innerRadius = size === "compact" ? 34 : size === "large" ? 78 : 52;
  const outerRadius = size === "compact" ? 54 : size === "large" ? 118 : 78;

  if (data.length === 0 || data.every((d) => d.vat === 0 && d.taxBase === 0)) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-[14px] text-muted-foreground",
          height,
          className,
        )}
      >
        {t("noVatData")}
      </div>
    );
  }

  return (
    <ChartContainer
      config={config}
      className={cn("aspect-auto mx-auto w-full", height, className)}
    >
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="key"
              formatter={(value, _name, item) => (
                <div className="flex w-full flex-col gap-0.5">
                  <span className="font-medium text-ink">
                    {item?.payload?.rate ?? ""} %
                  </span>
                  <span className="money text-ink">
                    DPH {formatMoney(Number(value), currency, locale)}
                  </span>
                  <span className="text-muted-foreground">
                    Základ{" "}
                    {formatMoney(
                      Number(item?.payload?.taxBase ?? 0),
                      currency,
                      locale,
                    )}
                  </span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={data}
          dataKey="vat"
          nameKey="key"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          strokeWidth={2}
          stroke="var(--surface)"
        >
          {data.map((entry) => (
            <Cell key={entry.key} fill={entry.fill} />
          ))}
        </Pie>
        {size === "compact" ? null : (
          <ChartLegend content={<ChartLegendContent nameKey="key" />} />
        )}
      </PieChart>
    </ChartContainer>
  );
}
