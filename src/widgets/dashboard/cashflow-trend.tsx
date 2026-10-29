"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import { formatMoney } from "@/shared/lib/format";

const config = {
  paid: {
    label: "Inkaso",
    color: "var(--chart-3)",
  },
  issued: {
    label: "Vystavené",
    color: "var(--text)",
  },
} satisfies ChartConfig;

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Máj",
  "Jún",
  "Júl",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dec",
];

export function CashflowTrend({
  currency,
  months,
  yearPaidTotal,
  yearIssuedTotal,
}: {
  currency: string;
  yearPaidTotal: number;
  yearIssuedTotal: number;
  months: {
    month: number;
    paidAmount: number;
    issuedAmount: number;
  }[];
}) {
  const data = months.map((m) => ({
    month: monthNames[m.month - 1] ?? String(m.month),
    paid: m.paidAmount,
    issued: m.issuedAmount,
  }));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-medium text-ink">Cashflow trend</h2>
        <div className="flex flex-wrap gap-4 text-[12px] text-muted-foreground">
          <span>
            Inkaso{" "}
            <span className="money text-chart">
              {formatMoney(yearPaidTotal, currency)}
            </span>
          </span>
          <span>
            Vystavené{" "}
            <span className="money text-ink">
              {formatMoney(yearIssuedTotal, currency)}
            </span>
          </span>
        </div>
      </div>
      <div className="border-t border-rule pt-3">
        <ChartContainer config={config} className="aspect-auto h-[200px] w-full">
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
                new Intl.NumberFormat("sk-SK", {
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
                      {formatMoney(Number(value), currency)}
                      <span className="ml-1 text-muted-foreground">
                        {name === "paid" ? "inkaso" : "vystavené"}
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
      </div>
    </div>
  );
}
