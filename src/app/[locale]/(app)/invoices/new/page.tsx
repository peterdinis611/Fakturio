import { getTranslations } from "next-intl/server";
import { listCustomers } from "@/features/customers/api/customers";
import { getCompany } from "@/features/company/api/company";
import { listServices } from "@/features/services/api/services";
import { InvoiceForm } from "@/features/invoices/ui/invoice-form";
import { NewInvoiceNeedsCustomer } from "@/features/invoices/ui/new-invoice-gate";
import { PageHeader } from "@/widgets/app-shell/page-header";

export async function generateMetadata() {
  const t = await getTranslations("InvoiceDetail");
  return { title: t("newTitle") };
}

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; type?: string }>;
}) {
  const t = await getTranslations("InvoiceDetail");
  const sp = await searchParams;
  const documentType = sp.type === "Proforma" ? "Proforma" : "Invoice";
  const [customers, company, services] = await Promise.all([
    listCustomers({ pageSize: 100 }),
    getCompany(),
    listServices({ pageSize: 100, activeOnly: true }),
  ]);

  if (customers.items.length === 0) {
    return (
      <div>
        <PageHeader title={t("newTitle")} />
        <NewInvoiceNeedsCustomer />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={
          documentType === "Proforma" ? t("newProforma") : t("newTitle")
        }
        description={
          documentType === "Proforma"
            ? "Zálohová (ZF…) nie je daňový doklad — neskôr ju môžeš finalizovať."
            : "Koncept môžeš vystaviť neskôr; PDF až po uložení."
        }
        ledger={
          <>
            <span>
              {company.isVatPayer
                ? `Predvolené DPH ${company.defaultVatRate}%`
                : t("notVatPayer")}
            </span>
            <span>{t("dueInDays", { count: company.defaultDueDays })}</span>
            <span>{company.defaultCurrency}</span>
          </>
        }
      />
      <InvoiceForm
        customers={customers.items.map((c) => ({ id: c.id, name: c.name }))}
        defaultCustomerId={sp.customerId}
        defaultDocumentType={documentType}
        catalogItems={services.items}
        companyDefaults={{
          defaultVatRate: company.defaultVatRate,
          defaultCurrency: company.defaultCurrency,
          defaultPaymentMethod: company.defaultPaymentMethod,
          bankIban: company.bankIban,
          bankBic: company.bankBic,
          defaultDueDays: company.defaultDueDays,
          isVatPayer: company.isVatPayer,
        }}
      />
    </div>
  );
}
