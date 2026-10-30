import { getLocale, getTranslations } from "next-intl/server";
import { getReminders, listInvoices } from "@/features/invoices/api/invoices";
import { getMonthlyRevenue, getReportOverview } from "@/features/reports/api/reports";
import { DashboardEmpty } from "@/widgets/dashboard/dashboard-empty";
import { DashboardSections } from "@/widgets/dashboard/dashboard-sections";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { MotionItem } from "@/shared/ui/motion/page-motion";
import { Button } from "@/shared/ui/button";
import { formatDate, formatMoney } from "@/shared/lib/format";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

export async function generateMetadata() {
  const t = await getTranslations("Dashboard");
  return { title: t("title") };
}

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const locale = (await getLocale()) as AppLocale;
  const year = new Date().getFullYear();
  const [overview, recent, reminders, monthly, draftsPage] = await Promise.all([
    getReportOverview(),
    listInvoices({ page: 1, pageSize: 8 }),
    getReminders({ withinDays: 14 }),
    getMonthlyRevenue(year),
    listInvoices({ page: 1, pageSize: 5, status: "Draft" }),
  ]);

  const isEmpty = overview.totalInvoices === 0;

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
      <PageHeader
        title={t("title")}
        description={finding}
        actions={
          isEmpty ? undefined : (
            <Button asChild>
              <Link href="/invoices/new">{t("newInvoice")}</Link>
            </Button>
          )
        }
      />

      {isEmpty ? (
        <MotionItem>
          <DashboardEmpty />
        </MotionItem>
      ) : null}

      <DashboardSections
        overview={overview}
        reminders={reminders}
        drafts={draftsPage.items}
        recent={recent.items}
        monthly={monthly}
        showSectionLabel={isEmpty}
      />
    </>
  );
}
