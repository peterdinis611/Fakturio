import { getTranslations } from "next-intl/server";
import { getMonthlyRevenue } from "@/features/reports/api/reports";
import { CashflowTrend } from "@/widgets/dashboard/cashflow-trend";

export async function generateMetadata() {
  const t = await getTranslations("Dashboard");
  return { title: t("cashflowPopoutTitle") };
}

function parseYear(raw: string | undefined, fallback: number) {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 2000 && n <= 2100 ? n : fallback;
}

export default async function CashflowPopoutPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await searchParams;
  const year = parseYear(params.year, new Date().getFullYear());
  const monthly = await getMonthlyRevenue(year);

  return (
    <CashflowTrend
      mode="popout"
      year={monthly.year}
      currency={monthly.currency}
      months={monthly.months}
      yearPaidTotal={monthly.yearPaidTotal}
      yearIssuedTotal={monthly.yearIssuedTotal}
    />
  );
}
