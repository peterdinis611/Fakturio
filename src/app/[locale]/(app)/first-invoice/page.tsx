import { getTranslations } from "next-intl/server";
import { getCompany } from "@/features/company/api/company";
import { lookupCustomers } from "@/features/customers/api/customers";
import { listInvoices } from "@/features/invoices/api/invoices";
import { listServices } from "@/features/services/api/services";
import { FirstInvoiceWizard } from "@/features/onboarding/ui/first-invoice-wizard";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { Link, redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { Button } from "@/shared/ui/button";

export async function generateMetadata() {
  const t = await getTranslations("FirstInvoice");
  return { title: t("title") };
}

export default async function FirstInvoicePage() {
  const t = await getTranslations("FirstInvoice");
  const locale = await getLocale();
  const [company, customers, services, invoices] = await Promise.all([
    getCompany(),
    lookupCustomers({ limit: 50 }),
    listServices({ pageSize: 100, activeOnly: true }),
    listInvoices({ page: 1, pageSize: 1 }),
  ]);

  if (invoices.totalCount > 0) {
    redirect({ href: "/dashboard", locale });
  }

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild variant="ghost">
            <Link href="/dashboard">{t("skip")}</Link>
          </Button>
        }
      />
      <FirstInvoiceWizard
        customers={customers}
        catalogItems={services.items}
        defaultVatRate={company.defaultVatRate}
        isVatPayer={company.isVatPayer}
        defaultCurrency={company.defaultCurrency}
      />
    </div>
  );
}
