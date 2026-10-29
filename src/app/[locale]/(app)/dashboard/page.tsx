import Link from "next/link";
import { getReminders, listInvoices } from "@/features/invoices/api/invoices";
import { getMonthlyRevenue, getReportOverview } from "@/features/reports/api/reports";
import { DashboardEmpty } from "@/widgets/dashboard/dashboard-empty";
import { DashboardSections } from "@/widgets/dashboard/dashboard-sections";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { MotionItem } from "@/shared/ui/motion/page-motion";
import { Button } from "@/shared/ui/button";
import { formatDate, formatMoney } from "@/shared/lib/format";

export const metadata = { title: "Prehľad" };

export default async function DashboardPage() {
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
    ? "Zatiaľ prázdny ledger — vystav prvú faktúru."
    : overview.overdueCount > 0
      ? `${overview.overdueCount} po splatnosti · ${formatMoney(overview.overdueAmount, overview.currency)}`
      : reminders.length > 0
        ? `${reminders.length} splatností v najbližších 14 dňoch`
        : `K ${formatDate(overview.asOf)} · ${overview.totalInvoices} faktúr`;

  if (isEmpty) {
    return (
      <>
        <PageHeader title="Prehľad" description={finding} />
        <MotionItem>
          <DashboardEmpty />
        </MotionItem>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Prehľad"
        description={finding}
        actions={
          <Button asChild>
            <Link href="/invoices/new">Nová faktúra</Link>
          </Button>
        }
      />

      <DashboardSections
        overview={overview}
        reminders={reminders}
        drafts={draftsPage.items}
        recent={recent.items}
        monthly={monthly}
      />
    </>
  );
}
