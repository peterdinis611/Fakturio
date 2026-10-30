"use client";

import { useLocale } from "next-intl";
import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import type { InvoiceStatus } from "@/shared/api/types";
import { formatMoney, statusLabelFor } from "@/shared/lib/format";
import type { AppLocale } from "@/i18n/routing";

const statusColor: Record<InvoiceStatus, string> = {
  Draft: "var(--faint)",
  Issued: "var(--text)",
  Paid: "var(--chart-3)",
  Overdue: "var(--negative)",
  Cancelled: "var(--control)",
};

export function StatusChart({
  currency,
  rows,
}: {
  currency: string;
  rows: { status: InvoiceStatus; count: number; amount: number }[];
}) {
  const locale = useLocale() as AppLocale;
  const config = Object.fromEntries(
    rows.map((r) => [
      r.status,
      {
        label: statusLabelFor(r.status, locale),
        color: statusColor[r.status],
      },
    ]),
  ) satisfies ChartConfig;

  const data = rows
    .filter((r) => r.count > 0 || r.amount > 0)
    .map((r) => ({
      status: r.status,
      count: r.count,
      amount: r.amount,
      fill: statusColor[r.status],
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-[14px] text-muted-foreground">
        Žiadne faktúry v období
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="aspect-auto mx-auto h-[220px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="status"
              formatter={(value, _name, item) => (
                <div className="flex w-full flex-col gap-0.5">
                  <span className="font-medium text-ink">
                    {statusLabelFor(
                      item?.payload?.status as InvoiceStatus,
                      locale,
                    )}
                  </span>
                  <span className="money text-ink">
                    {formatMoney(Number(value), currency, locale)}
                  </span>
                  <span className="text-muted-foreground">
                    {item?.payload?.count ?? 0}
                  </span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={data}
          dataKey="amount"
          nameKey="status"
          innerRadius={52}
          outerRadius={78}
          strokeWidth={2}
          stroke="var(--surface)"
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
      </PieChart>
    </ChartContainer>
  );
}
