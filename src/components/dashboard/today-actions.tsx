import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dueDaysLabel } from "@/components/dashboard/due-days";
import { Button } from "@/components/ui/button";
import type { InvoiceListItem, InvoiceReminder, ReportOverview } from "@/lib/api/types";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TodayAction = {
  id: string;
  priority: number;
  tone: "negative" | "warning" | "ink" | "muted";
  title: string;
  detail: string;
  href: string;
  cta: string;
};

export function buildTodayActions(params: {
  overview: ReportOverview;
  reminders: InvoiceReminder[];
  drafts: InvoiceListItem[];
}): TodayAction[] {
  const { overview, reminders, drafts } = params;
  const actions: TodayAction[] = [];

  if (overview.overdueCount > 0) {
    actions.push({
      id: "overdue",
      priority: 0,
      tone: "negative",
      title:
        overview.overdueCount === 1
          ? "1 faktúra po splatnosti"
          : `${overview.overdueCount} faktúr po splatnosti`,
      detail: formatMoney(overview.overdueAmount, overview.currency),
      href: "/reminders?overdue=1",
      cta: "Riešiť",
    });
  }

  const dueSoon = reminders.filter((r) => !r.isOverdue && r.daysUntilDue <= 3);
  if (dueSoon.length > 0) {
    const first = dueSoon[0]!;
    actions.push({
      id: "due-soon",
      priority: 1,
      tone: "warning",
      title:
        dueSoon.length === 1
          ? `${first.number} o ${dueDaysLabel(first)}`
          : `${dueSoon.length} splatností do 3 dní`,
      detail:
        dueSoon.length === 1
          ? `${first.customerName} · ${formatMoney(first.total, first.currency)}`
          : `Najbližšie ${formatDate(first.dueDate)}`,
      href: "/reminders",
      cta: "Pozrieť",
    });
  }

  if (drafts.length > 0) {
    const d = drafts[0]!;
    actions.push({
      id: "drafts",
      priority: 2,
      tone: "ink",
      title:
        drafts.length === 1
          ? `Dokončiť koncept ${d.number}`
          : `${drafts.length} konceptov čaká na vystavenie`,
      detail:
        drafts.length === 1
          ? d.customerName
          : `Napr. ${d.number} · ${d.customerName}`,
      href:
        drafts.length === 1
          ? `/invoices/${d.id}/edit`
          : "/invoices?status=Draft",
      cta: "Otvoriť",
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "clear",
      priority: 9,
      tone: "muted",
      title: "Dnes nič naliehavé",
      detail: "Ledger je v poriadku — môžeš vystaviť ďalšiu faktúru.",
      href: "/invoices/new",
      cta: "Nová faktúra",
    });
  }

  return actions.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

export function TodayActions({ actions }: { actions: TodayAction[] }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-medium text-ink">Čo urobiť dnes</h2>
        <span className="text-[12px] text-faint tabular-nums">
          {actions.length}
        </span>
      </div>
      <ul className="divide-y divide-rule border-t border-rule">
        {actions.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-[14px] font-medium",
                  a.tone === "negative" && "text-negative",
                  a.tone === "warning" && "text-warning",
                  a.tone === "ink" && "text-ink",
                  a.tone === "muted" && "text-muted-foreground",
                )}
              >
                {a.title}
              </p>
              <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                {a.detail}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={a.href}>
                {a.cta}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
