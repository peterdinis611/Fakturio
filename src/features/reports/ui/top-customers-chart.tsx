"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
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

export function TopCustomersChart({
  currency,
  customers,
  className,
}: {
  currency: string;
  customers: {
    customerId: string;
    customerName: string;
    totalAmount: number;
    shareOfRevenuePercent: number;
  }[];
  className?: string;
}) {
  const t = useTranslations("Reports");
  const locale = useLocale() as AppLocale;
  const intl = intlLocale(locale);

  const config = {
    total: {
      label: t("topCustomers"),
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  const data = customers.slice(0, 8).map((c) => ({
    id: c.customerId,
    name:
      c.customerName.length > 22
        ? `${c.customerName.slice(0, 21)}…`
        : c.customerName,
    fullName: c.customerName,
    total: c.totalAmount,
    share: c.shareOfRevenuePercent,
  }));

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex h-[240px] items-center justify-center text-[14px] text-muted-foreground",
          className,
        )}
      >
        {t("noInvoicesPeriod")}
      </div>
    );
  }

  return (
    <ChartContainer
      config={config}
      className={cn("aspect-auto h-[260px] w-full", className)}
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 4, right: 12 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--rule)" />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          width={132}
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
              labelFormatter={(_label, payload) =>
                String(payload?.[0]?.payload?.fullName ?? "")
              }
              formatter={(value, _name, item) => (
                <div className="flex w-full flex-col gap-0.5">
                  <span className="money font-medium text-ink">
                    {formatMoney(Number(value), currency, locale)}
                  </span>
                  <span className="text-muted-foreground">
                    {(item?.payload?.share ?? 0).toFixed(1)} %
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey="total"
          fill="var(--color-total)"
          radius={[0, 2, 2, 0]}
          maxBarSize={20}
        />
      </BarChart>
    </ChartContainer>
  );
}
