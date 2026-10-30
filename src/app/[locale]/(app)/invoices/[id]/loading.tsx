import { getTranslations } from "next-intl/server";
import { PageLoader } from "@/shared/ui/spinner";

export default async function InvoiceDetailLoading() {
  const t = await getTranslations("Loading");
  return <PageLoader label={t("invoice")} />;
}
