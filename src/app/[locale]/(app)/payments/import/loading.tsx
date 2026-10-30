import { getTranslations } from "next-intl/server";
import { PageLoader } from "@/shared/ui/spinner";

export default async function PaymentImportLoading() {
  const t = await getTranslations("Loading");
  return <PageLoader label={t("payments")} />;
}
