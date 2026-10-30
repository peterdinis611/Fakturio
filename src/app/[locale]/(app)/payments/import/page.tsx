import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { PaymentImportPanel } from "@/features/payments/ui/payment-import";

export async function generateMetadata() {
  const t = await getTranslations("Payments");
  return { title: t("title") };
}

export default async function PaymentImportPage() {
  const t = await getTranslations("Payments");

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <PaymentImportPanel />
    </div>
  );
}
