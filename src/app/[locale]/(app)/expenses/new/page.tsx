import { getTranslations } from "next-intl/server";
import { listCustomers } from "@/features/customers/api/customers";
import { getCompany } from "@/features/company/api/company";
import { CompanyNotReadyGate } from "@/features/company/ui/company-not-ready-gate";
import { listServices } from "@/features/services/api/services";
import { InvoiceForm } from "@/features/invoices/ui/invoice-form";
import { NewInvoiceNeedsCustomer } from "@/features/invoices/ui/new-invoice-gate";
import { PageHeader } from "@/widgets/app-shell/page-header";
import type { InvoiceDocumentType } from "@/shared/api/types";

export async function generateMetadata() {
  const t = await getTranslations("Documents");
  return { title: t("newExpense") };
}

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; type?: string }>;
}) {
  const t = await getTranslations("Documents");
  const sp = await searchParams;
  const allowedTypes = new Set([
    "Invoice",
    "Proforma",
    "Quote",
    "DeliveryNote",
    "SalesOrder",
  ]);
  const documentType = (
    allowedTypes.has(sp.type ?? "") ? sp.type : "Invoice"
  ) as InvoiceDocumentType;

  const [customers, company, services] = await Promise.all([
    listCustomers({ pageSize: 100 }),
    getCompany(),
    listServices({ pageSize: 100, activeOnly: true }),
  ]);

  if (!company.completeness.isReadyToInvoice) {
    return (
      <div>
        <PageHeader title={t("newExpense")} />
        <CompanyNotReadyGate />
      </div>
    );
  }

  if (customers.items.length === 0) {
    return (
      <div>
        <PageHeader title={t("newExpense")} />
        <NewInvoiceNeedsCustomer />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("newExpense")}
        description={t("expenseNewHint")}
        ledger={
          <>
            <span>
              {company.isVatPayer
                ? `DPH ${company.defaultVatRate}%`
                : "Bez DPH"}
            </span>
            <span>{company.defaultCurrency}</span>
          </>
        }
      />
      <InvoiceForm
        customers={customers.items.map((c) => ({ id: c.id, name: c.name }))}
        defaultCustomerId={sp.customerId}
        defaultDocumentType={documentType}
        defaultFlow="Received"
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
