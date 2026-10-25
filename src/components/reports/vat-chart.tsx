"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatMoney } from "@/lib/format";

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
}: {
  currency: string;
  rows: { vatRate: number; vatAmount: number; taxBase: number }[];
}) {
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

  if (data.length === 0 || data.every((d) => d.vat === 0 && d.taxBase === 0)) {
    return (
      <div className="flex h-[220px] items-center justify-center text-[14px] text-muted-foreground">
        Žiadne DPH údaje v období
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="aspect-auto mx-auto h-[220px] w-full">
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
                    DPH {formatMoney(Number(value), currency)}
                  </span>
                  <span className="text-muted-foreground">
                    Základ{" "}
                    {formatMoney(Number(item?.payload?.taxBase ?? 0), currency)}
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
          innerRadius={52}
          outerRadius={78}
          strokeWidth={2}
          stroke="var(--surface)"
        >
          {data.map((entry) => (
            <Cell key={entry.key} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="key" />} />
      </PieChart>
    </ChartContainer>
  );
}
