import { getTranslations } from "next-intl/server";
import { AdminPanelClient } from "@/features/admin/ra/admin-panel-client";

export async function generateMetadata() {
  const t = await getTranslations("Admin");
  return { title: `${t("title")} · Panel` };
}

export default async function AdminPanelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basename =
    locale === "sk" ? "/admin/panel" : `/${locale}/admin/panel`;

  return (
    <div className="-mx-4 -mb-8 min-h-[70vh] overflow-hidden rounded-lg border border-border bg-background sm:-mx-6">
      <AdminPanelClient basename={basename} />
    </div>
  );
}
