import { getTranslations } from "next-intl/server";
import { SettingsNav } from "@/features/settings/ui/settings-nav";
import { PageHeader } from "@/widgets/app-shell/page-header";

export async function generateMetadata() {
  const t = await getTranslations("Settings");
  return { title: t("title") };
}

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Settings");

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title={t("title")} description={t("description")} />
      <SettingsNav />
      {children}
    </div>
  );
}
