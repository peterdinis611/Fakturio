import Link from "next/link";
import type { ReportOverview } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { formatMoney } from "@/shared/lib/format";

export function OverdueAlert({ overview }: { overview: ReportOverview }) {
  if (overview.overdueCount <= 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
      <p className="text-[14px] text-ink">
        <span className="stamp mr-2 inline-flex border-negative text-negative">
          !
        </span>
        {overview.overdueCount}{" "}
        {overview.overdueCount === 1 ? "faktúra je" : "faktúr je"} po splatnosti
        —{" "}
        <span className="money text-negative">
          {formatMoney(overview.overdueAmount, overview.currency)}
        </span>
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/reminders?overdue=1">Riešiť upomienky</Link>
      </Button>
    </div>
  );
}
