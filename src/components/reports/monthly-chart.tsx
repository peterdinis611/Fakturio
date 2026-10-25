"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatMoney } from "@/lib/format";

const config = {
  paid: {
    label: "Zaplatené",
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

export function MonthlyRevenueChart({
  currency,
  months,
}: {
  currency: string;
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
    <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ left: 4, right: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--rule)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "var(--muted)", fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tick={{ fill: "var(--muted)", fontSize: 11 }}
          tickFormatter={(v) =>
            new Intl.NumberFormat("sk-SK", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(Number(v))
          }
        />
        <ChartTooltip
          cursor={{ fill: "var(--raised)", opacity: 0.5 }}
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-6">
                  <span className="text-muted-foreground">
                    {config[name as keyof typeof config]?.label ?? name}
                  </span>
                  <span className="money font-medium text-ink">
                    {formatMoney(Number(value), currency)}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="issued"
          fill="var(--color-issued)"
          radius={[2, 2, 0, 0]}
          maxBarSize={18}
        />
        <Bar
          dataKey="paid"
          fill="var(--color-paid)"
          radius={[2, 2, 0, 0]}
          maxBarSize={18}
        />
      </BarChart>
    </ChartContainer>
  );
}
