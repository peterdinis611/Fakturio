import { getTranslations } from "next-intl/server";
import { getCompany } from "@/features/company/api/company";
import { CompanyNotReadyGate } from "@/features/company/ui/company-not-ready-gate";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { PaymentImportPanel } from "@/features/payments/ui/payment-import";

export async function generateMetadata() {
  const t = await getTranslations("Payments");
  return { title: t("title") };
}

export default async function PaymentImportPage() {
  const t = await getTranslations("Payments");
  const company = await getCompany();

  if (!company.completeness.isReadyToInvoice) {
    return (
      <div>
        <PageHeader title={t("title")} description={t("description")} />
        <CompanyNotReadyGate />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <PaymentImportPanel />
    </div>
  );
}
