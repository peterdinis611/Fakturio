import type { ReportOverview } from "@/shared/api/types";
import { formatMoney } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  overview: ReportOverview;
  locale: AppLocale;
  labels: {
    unpaidTotal: string;
    cashflowCollected: string;
    issued: string;
    paid: string;
    unpaid: string;
  };
};

export function LedgerLead({ overview, locale, labels }: Props) {
  const unpaidOpen = Math.max(
    0,
    overview.outstandingAmount - overview.overdueAmount,
  );
  const mixTotal =
    overview.paidAmount + unpaidOpen + overview.overdueAmount;
  const mix = {
    paid: mixTotal > 0 ? (overview.paidAmount / mixTotal) * 100 : 0,
    open: mixTotal > 0 ? (unpaidOpen / mixTotal) * 100 : 0,
    overdue: mixTotal > 0 ? (overview.overdueAmount / mixTotal) * 100 : 0,
  };

  return (
    <div className="mb-8">
      <div className="grid gap-6 sm:grid-cols-[1.4fr_auto_auto] sm:items-end">
        <div>
          <p className="text-[13px] text-muted-foreground">{labels.unpaidTotal}</p>
          <p
            className={cn(
              "money mt-1 text-[32px] leading-none tracking-tight",
              overview.outstandingAmount > 0 ? "text-ink" : "text-faint",
            )}
          >
            {formatMoney(overview.outstandingAmount, overview.currency, locale)}
          </p>
        </div>
        <div>
          <p className="text-[13px] text-muted-foreground">
            {labels.cashflowCollected}
          </p>
          <p className="money mt-1 text-[24px] leading-none text-chart">
            {overview.collectionRatePercent.toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-[13px] text-muted-foreground">{labels.issued}</p>
          <p className="money mt-1 text-[24px] leading-none text-ink">
            {formatMoney(overview.issuedAmount, overview.currency, locale)}
          </p>
        </div>
      </div>

      {mixTotal > 0 ? (
        <div className="mt-5" aria-hidden>
          <div className="bar-track flex">
            {mix.paid > 0 ? (
              <div
                className="h-full bg-positive/70"
                style={{ width: `${mix.paid}%` }}
              />
            ) : null}
            {mix.open > 0 ? (
              <div
                className="h-full bg-chart"
                style={{ width: `${mix.open}%` }}
              />
            ) : null}
            {mix.overdue > 0 ? (
              <div
                className="h-full bg-negative"
                style={{ width: `${mix.overdue}%` }}
              />
            ) : null}
          </div>
          <div className="ledger-strip mt-2 mb-0 border-0 pb-0 text-[12px]">
            <span>
              <span className="mr-1.5 inline-block size-1.5 bg-positive/70" />
              {labels.paid}{" "}
              <span className="money text-ink">
                {formatMoney(overview.paidAmount, overview.currency, locale)}
              </span>
            </span>
            <span>
              <span className="mr-1.5 inline-block size-1.5 bg-chart" />
              {labels.unpaid}{" "}
              <span className="money text-ink">
                {formatMoney(unpaidOpen, overview.currency, locale)}
              </span>
            </span>
            {overview.overdueAmount > 0 ? (
              <span>
                <span className="mr-1.5 inline-block size-1.5 bg-negative" />
                Po splatnosti{" "}
                <span className="money text-negative">
                  {formatMoney(overview.overdueAmount, overview.currency, locale)}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
