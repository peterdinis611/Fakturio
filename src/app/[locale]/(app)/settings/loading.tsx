import { getTranslations } from "next-intl/server";
import { PageLoader } from "@/shared/ui/spinner";

export default async function SettingsLoading() {
  const t = await getTranslations("Loading");
  return <PageLoader label={t("default")} />;
}
