"use client";

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

const config = {
  amount: {
    label: "Suma",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const bucketFill: Record<string, string> = {
  current: "var(--text)",
  "1-30": "var(--chart-3)",
  "31-60": "var(--warning)",
  "61-90": "var(--negative)",
  "90+": "var(--negative)",
};

export function AgingChart({
  currency,
  buckets,
}: {
  currency: string;
  buckets: { key: string; label: string; amount: number; count: number }[];
}) {
  const data = buckets.map((b) => ({
    key: b.key,
    label: b.label,
    amount: b.amount,
    count: b.count,
    fill: bucketFill[b.key] ?? "var(--chart-3)",
  }));

  return (
    <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
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
            new Intl.NumberFormat("sk-SK", {
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
                    {formatMoney(Number(value), currency)}
                  </span>
                  <span className="text-muted-foreground">
                    {item?.payload?.count ?? 0} faktúr
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
