import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dueDaysLabel, type DueDaysTranslate } from "@/widgets/dashboard/due-days";
import { Button } from "@/shared/ui/button";
import type { InvoiceListItem, InvoiceReminder, ReportOverview } from "@/shared/api/types";
import { formatDate, formatMoney } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { AppLocale } from "@/i18n/routing";

export type TodayAction = {
  id: string;
  priority: number;
  tone: "negative" | "warning" | "ink" | "muted";
  title: string;
  detail: string;
  href: string;
  cta: string;
};

type DashboardTranslate = DueDaysTranslate &
  ((
    key:
      | "overdueInvoices"
      | "handleReminders"
      | "dueSoon"
      | "draftsTitle"
      | "emptyTitle"
      | "todayIdle"
      | "emptyBody"
      | "sectionHint"
      | "newInvoice"
      | "todayTitle",
    values?: { count: number },
  ) => string);

export function buildTodayActions(params: {
  overview: ReportOverview;
  reminders: InvoiceReminder[];
  drafts: InvoiceListItem[];
  locale: AppLocale;
  t: DashboardTranslate;
}): TodayAction[] {
  const { overview, reminders, drafts, locale, t } = params;
  const actions: TodayAction[] = [];

  if (overview.overdueCount > 0) {
    actions.push({
      id: "overdue",
      priority: 0,
      tone: "negative",
      title: t("overdueInvoices", { count: overview.overdueCount }),
      detail: formatMoney(overview.overdueAmount, overview.currency, locale),
      href: "/reminders?overdue=1",
      cta: t("handleReminders"),
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
          ? `${first.number} · ${dueDaysLabel(first, t)}`
          : t("dueSoon"),
      detail:
        dueSoon.length === 1
          ? `${first.customerName} · ${formatMoney(first.total, first.currency, locale)}`
          : formatDate(first.dueDate, locale),
      href: "/reminders",
      cta: t("dueSoon"),
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
          ? `${t("draftsTitle")} ${d.number}`
          : `${drafts.length} · ${t("draftsTitle")}`,
      detail:
        drafts.length === 1
          ? d.customerName
          : `${d.number} · ${d.customerName}`,
      href:
        drafts.length === 1
          ? `/invoices/${d.id}/edit`
          : "/invoices?status=Draft",
      cta: t("draftsTitle"),
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "clear",
      priority: 9,
      tone: "muted",
      title:
        overview.totalInvoices === 0
          ? t("emptyTitle")
          : t("todayIdle"),
      detail:
        overview.totalInvoices === 0
          ? t("emptyBody")
          : t("sectionHint"),
      href: "/invoices/new",
      cta: t("newInvoice"),
    });
  }

  return actions.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

export function TodayActions({
  actions,
  title,
}: {
  actions: TodayAction[];
  title: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-medium text-ink">{title}</h2>
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
