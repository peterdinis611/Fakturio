import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getAdminOverview } from "@/features/admin/api/admin";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { AdminOverviewBody } from "@/widgets/admin/admin-overview";
import { SectionLoader } from "@/shared/ui/spinner";

export async function generateMetadata() {
  const t = await getTranslations("Admin");
  return { title: t("title") };
}

export default async function AdminPage() {
  const dataPromise = getAdminOverview();
  const t = await getTranslations("Admin");
  const tl = await getTranslations("Loading");

  return (
    <div>
      <PageHeader title={t("title")} description={t("lead")} />
      <Suspense
        fallback={
          <SectionLoader label={tl("dashboard")} rows={8} className="mt-2" />
        }
      >
        <AdminOverviewBody dataPromise={dataPromise} />
      </Suspense>
    </div>
  );
}
