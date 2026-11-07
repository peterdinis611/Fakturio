import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import {
  DashboardBody,
  loadDashboard,
} from "@/widgets/dashboard/dashboard-body";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { SectionLoader } from "@/shared/ui/spinner";

export async function generateMetadata() {
  const t = await getTranslations("Dashboard");
  return { title: t("title") };
}

export default async function DashboardPage() {
  // Preload before awaiting i18n so API work overlaps with the shell render.
  const dataPromise = loadDashboard();
  const t = await getTranslations("Dashboard");
  const tl = await getTranslations("Loading");

  return (
    <div>
      <PageHeader title={t("title")} />

      <Suspense
        fallback={
          <SectionLoader label={tl("dashboard")} rows={8} className="mt-2" />
        }
      >
        <DashboardBody dataPromise={dataPromise} />
      </Suspense>
    </div>
  );
}
