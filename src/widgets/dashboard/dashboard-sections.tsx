import type {
  InvoiceListItem,
  InvoiceReminder,
  MonthlyRevenue,
  ReportOverview,
} from "@/shared/api/types";
import { MotionItem } from "@/shared/ui/motion/page-motion";
import { CashflowTrend } from "@/widgets/dashboard/cashflow-trend";
import { LedgerLead } from "@/widgets/dashboard/ledger-lead";
import { OverdueAlert } from "@/widgets/dashboard/overdue-alert";
import { RecentInvoices } from "@/widgets/dashboard/recent-invoices";
import { StatusBuckets } from "@/widgets/dashboard/status-buckets";
import {
  buildTodayActions,
  TodayActions,
} from "@/widgets/dashboard/today-actions";
import { UpcomingDue } from "@/widgets/dashboard/upcoming-due";

type Props = {
  overview: ReportOverview;
  reminders: InvoiceReminder[];
  drafts: InvoiceListItem[];
  recent: InvoiceListItem[];
  monthly: MonthlyRevenue;
};

/** Prehľad = sklad widget sekcií (nie monolitiná page). */
export function DashboardSections({
  overview,
  reminders,
  drafts,
  recent,
  monthly,
}: Props) {
  return (
    <>
      {overview.overdueCount > 0 ? (
        <MotionItem>
          <OverdueAlert overview={overview} />
        </MotionItem>
      ) : null}

      <MotionItem>
        <LedgerLead overview={overview} />
      </MotionItem>

      <div className="mb-10 grid gap-10 lg:grid-cols-2">
        <MotionItem>
          <TodayActions
            actions={buildTodayActions({
              overview,
              reminders,
              drafts,
            })}
          />
        </MotionItem>
        <MotionItem>
          <CashflowTrend
            currency={monthly.currency}
            months={monthly.months}
            yearPaidTotal={monthly.yearPaidTotal}
            yearIssuedTotal={monthly.yearIssuedTotal}
          />
        </MotionItem>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <MotionItem>
          <StatusBuckets overview={overview} />
        </MotionItem>
        <MotionItem>
          <UpcomingDue reminders={reminders} />
        </MotionItem>
      </div>

      <MotionItem className="mt-10">
        <RecentInvoices items={recent} />
      </MotionItem>
    </>
  );
}
