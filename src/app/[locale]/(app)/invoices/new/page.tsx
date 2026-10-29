import { listCustomers } from "@/features/customers/api/customers";
import { getCompany } from "@/features/company/api/company";
import { listServices } from "@/features/services/api/services";
import { InvoiceForm } from "@/features/invoices/ui/invoice-form";
import { NewInvoiceNeedsCustomer } from "@/features/invoices/ui/new-invoice-gate";
import { PageHeader } from "@/widgets/app-shell/page-header";

export const metadata = { title: "Nová faktúra" };

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; type?: string }>;
}) {
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
        <PageHeader title="Nová faktúra" />
        <NewInvoiceNeedsCustomer />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={documentType === "Proforma" ? "Nová zálohová" : "Nová faktúra"}
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
                : "Neplatca DPH"}
            </span>
            <span>Splatnosť {company.defaultDueDays} dní</span>
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
