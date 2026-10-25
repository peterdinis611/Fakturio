import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const thisYear = yearBounds(currentYear);
  const lastYear = yearBounds(currentYear - 1);
  const last12From = isoDaysAgo(365);
  const today = new Date().toISOString().slice(0, 10);

  const presets = [
    {
      key: "ytd",
      label: "Tento rok",
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
      label: "Minulý rok",
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
      label: "Celé obdobie",
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
        className="panel flex flex-wrap items-end gap-3 px-4 py-3"
      >
        <div className="grid gap-1">
          <Label htmlFor="reports-from">Od</Label>
          <Input
            id="reports-from"
            type="date"
            name="from"
            defaultValue={values.from}
            className="w-[10.5rem]"
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="reports-to">Do</Label>
          <Input
            id="reports-to"
            type="date"
            name="to"
            defaultValue={values.to}
            className="w-[10.5rem]"
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="reports-year">Rok grafu</Label>
          <select
            id="reports-year"
            name="year"
            defaultValue={values.year}
            className="h-9 rounded-[4px] border border-border bg-surface px-2.5 text-[14px] text-ink outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/10"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <Label htmlFor="reports-top">Top N</Label>
          <select
            id="reports-top"
            name="top"
            defaultValue={values.top}
            className="h-9 rounded-[4px] border border-border bg-surface px-2.5 text-[14px] text-ink outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/10"
          >
            {[5, 8, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="h-9">
          Použiť filtre
        </Button>
        {(values.from || values.to) && (
          <Button asChild variant="ghost" className="h-9">
            <Link href={buildHref({ year: values.year, top: values.top })}>
              Zrušiť dátumy
            </Link>
          </Button>
        )}
      </form>
    </div>
  );
}
