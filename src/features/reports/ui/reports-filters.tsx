"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DatePickerField } from "@/features/reports/ui/date-picker-field";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";

export type ReportsFilterValues = {
  year: number;
  from?: string;
  to?: string;
  top: number;
};

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function yearBounds(year: number) {
  return {
    from: `${year}-01-01`,
    to: `${year}-12-31`,
  };
}

function buildHref(values: Partial<ReportsFilterValues> & { year: number }) {
  const params = new URLSearchParams();
  params.set("year", String(values.year));
  if (values.from) params.set("from", values.from);
  if (values.to) params.set("to", values.to);
  if (values.top) params.set("top", String(values.top));
  return `/reports?${params.toString()}`;
}

export function ReportsFilters({ values }: { values: ReportsFilterValues }) {
  const t = useTranslations("Reports");
  const tc = useTranslations("Common");
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const thisYear = yearBounds(currentYear);
  const lastYear = yearBounds(currentYear - 1);
  const last12From = isoDaysAgo(365);
  const today = new Date().toISOString().slice(0, 10);

  const [from, setFrom] = useState(values.from);
  const [to, setTo] = useState(values.to);
  const [year, setYear] = useState(String(values.year));
  const [top, setTop] = useState(String(values.top));

  const presets = [
    {
      key: "ytd",
      label: t("thisYear"),
      href: buildHref({
        year: currentYear,
        from: thisYear.from,
        to: today,
        top: values.top,
      }),
      active:
        values.from === thisYear.from &&
        (values.to === today || values.to === thisYear.to),
    },
    {
      key: "last",
      label: t("lastYear"),
      href: buildHref({
        year: currentYear - 1,
        from: lastYear.from,
        to: lastYear.to,
        top: values.top,
      }),
      active: values.from === lastYear.from && values.to === lastYear.to,
    },
    {
      key: "12m",
      label: "12 mesiacov",
      href: buildHref({
        year: currentYear,
        from: last12From,
        to: today,
        top: values.top,
      }),
      active: values.from === last12From && values.to === today,
    },
    {
      key: "all",
      label: t("allTime"),
      href: buildHref({ year: values.year, top: values.top }),
      active: !values.from && !values.to,
    },
  ];

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-1 border-b border-border">
        {presets.map((p) => (
          <Link
            key={p.key}
            href={p.href}
            className={cn(
              "relative -mb-px border-b-2 px-2.5 py-2 text-[13px] font-medium",
              p.active
                ? "border-ink text-ink"
                : "border-transparent text-muted-foreground hover:text-ink",
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <form
        action="/reports"
        method="get"
        className="panel flex flex-wrap items-end gap-3 px-4 py-3"
      >
        <DatePickerField
          id="reports-from"
          name="from"
          label={t("from")}
          value={from}
          onChange={setFrom}
        />
        <DatePickerField
          id="reports-to"
          name="to"
          label={t("to")}
          value={to}
          onChange={setTo}
        />

        <div className="grid gap-1">
          <Label htmlFor="reports-year">Rok grafu</Label>
          <input type="hidden" name="year" value={year} />
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger
              id="reports-year"
              size="default"
              className="h-9 w-[7.5rem] rounded-[4px] border-border bg-surface"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label htmlFor="reports-top">Top N</Label>
          <input type="hidden" name="top" value={top} />
          <Select value={top} onValueChange={setTop}>
            <SelectTrigger
              id="reports-top"
              size="default"
              className="h-9 w-[5.5rem] rounded-[4px] border-border bg-surface"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              {[5, 8, 10, 15, 20].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="h-9">
          {t("applyFilters")}
        </Button>
        {(from || to) && (
          <Button asChild variant="ghost" className="h-9">
            <Link href={buildHref({ year: Number(year), top: Number(top) })}>
              {tc("cancel")}
            </Link>
          </Button>
        )}
      </form>
    </div>
  );
}
