import { getLocale, getTranslations } from "next-intl/server";
import { getCompanySummary } from "@/features/company/api/company";
import { InvoiceReadyLink } from "@/features/company/ui/invoice-ready-link";
import { getReminders, listInvoices } from "@/features/invoices/api/invoices";
import {
  getMonthlyRevenue,
  getReportOverview,
} from "@/features/reports/api/reports";
import { DashboardEmpty } from "@/widgets/dashboard/dashboard-empty";
import { DashboardSections } from "@/widgets/dashboard/dashboard-sections";
import { MotionItem } from "@/shared/ui/motion/page-motion";
import { formatDate, formatMoney } from "@/shared/lib/format";
import type { AppLocale } from "@/i18n/routing";

export type DashboardData = Awaited<ReturnType<typeof loadDashboard>>;

/** Kick off all dashboard fetches in parallel (safe to start before Suspense). */
export function loadDashboard(year = new Date().getFullYear()) {
  return Promise.all([
    getReportOverview(),
    listInvoices({ page: 1, pageSize: 8 }),
    getReminders({ withinDays: 14 }),
    getMonthlyRevenue(year),
    listInvoices({ page: 1, pageSize: 5, status: "Draft" }),
    getCompanySummary().catch(() => null),
  ]).then(([overview, recent, reminders, monthly, draftsPage, company]) => ({
    overview,
    recent,
    reminders,
    monthly,
    drafts: draftsPage.items,
    company,
  }));
}

export async function DashboardBody({
  dataPromise,
}: {
  dataPromise: Promise<DashboardData>;
}) {
  const t = await getTranslations("Dashboard");
  const locale = (await getLocale()) as AppLocale;
  const { overview, recent, reminders, monthly, drafts, company } =
    await dataPromise;

  const isEmpty = overview.totalInvoices === 0;
  const ready = company?.isReadyToInvoice ?? false;

  const finding = isEmpty
    ? t("emptyFinding")
    : overview.overdueCount > 0
      ? t("overdueFinding", {
          count: overview.overdueCount,
          amount: formatMoney(
            overview.overdueAmount,
            overview.currency,
            locale,
          ),
        })
      : reminders.length > 0
        ? t("remindersFinding", { count: reminders.length })
        : t("defaultFinding", {
            date: formatDate(overview.asOf, locale),
            count: overview.totalInvoices,
          });

  return (
    <>
      <div className="-mt-3 mb-5 flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-2xl text-[14px] text-muted-foreground">{finding}</p>
        {isEmpty ? null : (
          <InvoiceReadyLink href="/invoices/new" ready={ready}>
            {t("newInvoice")}
          </InvoiceReadyLink>
        )}
      </div>

      {isEmpty ? (
        <MotionItem>
          <DashboardEmpty />
        </MotionItem>
      ) : null}

      <DashboardSections
        overview={overview}
        reminders={reminders}
        drafts={drafts}
        recent={recent.items}
        monthly={monthly}
        showSectionLabel={isEmpty}
      />
    </>
  );
}
