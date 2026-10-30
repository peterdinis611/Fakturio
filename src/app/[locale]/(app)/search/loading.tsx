import { getTranslations } from "next-intl/server";
import { PageLoader } from "@/shared/ui/spinner";

export default async function SearchLoading() {
  const t = await getTranslations("Loading");
  return <PageLoader label={t("search")} />;
}
