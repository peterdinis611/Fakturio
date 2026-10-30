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
  /** Show the Widgety section label (empty ledger onboarding). */
  showSectionLabel?: boolean;
};

/** Prehľad = sklad widget sekcií (nie monolitiná page). */
export function DashboardSections({
  overview,
  reminders,
  drafts,
  recent,
  monthly,
  showSectionLabel = false,
}: Props) {
  const body = (
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

  if (!showSectionLabel) return body;

  return (
    <section className="pt-10" aria-labelledby="dashboard-widgets-heading">
      <div className="mb-6 flex items-baseline justify-between gap-3 border-b border-rule pb-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.14em] text-faint uppercase">
            Plocha
          </p>
          <h2
            id="dashboard-widgets-heading"
            className="mt-1 text-[18px] font-semibold tracking-tight text-ink"
          >
            Widgety
          </h2>
        </div>
        <p className="max-w-xs text-right text-[12px] leading-snug text-muted-foreground">
          Neuhradené, splatnosti, cashflow a posledné faktúry — naplnia sa po
          prvej faktúre.
        </p>
      </div>
      {body}
    </section>
  );
}
