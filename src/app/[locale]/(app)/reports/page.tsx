import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ReportExportLinks } from "@/components/reports/export-links";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { ReportsFilters } from "@/components/reports/reports-filters";
import { SectionLoader } from "@/components/ui/spinner";

export const metadata = { title: "Reporty" };

function parseYear(raw: string | undefined, fallback: number) {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 2000 && n <= 2100 ? n : fallback;
}

function parseTop(raw: string | undefined) {
  const n = Number(raw);
  return [5, 8, 10, 15, 20].includes(n) ? n : 8;
}

function parseDate(raw: string | undefined) {
  if (!raw) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : undefined;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    from?: string;
    to?: string;
    top?: string;
  }>;
}) {
  const sp = await searchParams;
  const currentYear = new Date().getFullYear();
  const year = parseYear(sp.year, currentYear);
  const from = parseDate(sp.from);
  const to = parseDate(sp.to);
  const top = parseTop(sp.top);

  return (
    <div>
      <PageHeader
        title="Reporty"
        description="Obrat, aging, DPH a top zákazníci."
        actions={<ReportExportLinks from={from} to={to} />}
      />

      <ReportsFilters values={{ year, from, to, top }} />

      <Suspense
        fallback={
          <SectionLoader label="Načítavam reporty…" rows={8} className="mt-2" />
        }
      >
        <ReportsDashboard year={year} from={from} to={to} top={top} />
      </Suspense>
    </div>
  );
}
