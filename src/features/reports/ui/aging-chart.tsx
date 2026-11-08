"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import { formatMoney } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { intlLocale } from "@/i18n/locales";
import type { AppLocale } from "@/i18n/routing";

const bucketFill: Record<string, string> = {
  current: "var(--text)",
  "1_30": "var(--chart-3)",
  "1-30": "var(--chart-3)",
  "31_60": "var(--warning)",
  "31-60": "var(--warning)",
  "61_90": "var(--negative)",
  "61-90": "var(--negative)",
  "90_plus": "var(--negative)",
  "90+": "var(--negative)",
};

function agingLabel(
  t: (key: "agingCurrent" | "aging1_30" | "aging31_60" | "aging61_90" | "aging90_plus") => string,
  key: string,
  fallback: string,
) {
  switch (key) {
    case "current":
      return t("agingCurrent");
    case "1_30":
    case "1-30":
      return t("aging1_30");
    case "31_60":
    case "31-60":
      return t("aging31_60");
    case "61_90":
    case "61-90":
      return t("aging61_90");
    case "90_plus":
    case "90+":
      return t("aging90_plus");
    default:
      return fallback;
  }
}

export function AgingChart({
  currency,
  buckets,
  className,
}: {
  currency: string;
  buckets: { key: string; label: string; amount: number; count: number }[];
  className?: string;
}) {
  const t = useTranslations("Reports");
  const locale = useLocale() as AppLocale;
  const intl = intlLocale(locale);

  const config = {
    amount: {
      label: t("unpaid"),
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  const data = buckets.map((b) => ({
    key: b.key,
    label: agingLabel(t, b.key, b.label),
    amount: b.amount,
    count: b.count,
    fill: bucketFill[b.key] ?? "var(--chart-3)",
  }));

  return (
    <ChartContainer
      config={config}
      className={cn("aspect-auto h-[240px] w-full", className)}
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 8, right: 12 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--rule)" />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          axisLine={false}
          width={110}
          tick={{ fill: "var(--muted)", fontSize: 11 }}
        />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted)", fontSize: 11 }}
          tickFormatter={(v) =>
            new Intl.NumberFormat(intl, {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(Number(v))
          }
        />
        <ChartTooltip
          cursor={{ fill: "var(--raised)", opacity: 0.45 }}
          content={
            <ChartTooltipContent
              labelKey="label"
              formatter={(value, _name, item) => (
                <div className="flex w-full flex-col gap-0.5">
                  <span className="money font-medium text-ink">
                    {formatMoney(Number(value), currency, locale)}
                  </span>
                  <span className="text-muted-foreground">
                    {item?.payload?.count ?? 0} {t("invoices").toLowerCase()}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="amount" radius={[0, 2, 2, 0]} maxBarSize={22}>
          {data.map((entry) => (
            <Cell key={entry.key} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
