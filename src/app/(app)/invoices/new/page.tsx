import { listCustomers } from "@/actions/customers";
import { getCompany } from "@/actions/company";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { NewInvoiceNeedsCustomer } from "@/components/invoices/new-invoice-gate";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Nová faktúra" };

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const sp = await searchParams;
  const [customers, company] = await Promise.all([
    listCustomers({ pageSize: 100 }),
    getCompany(),
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
        title="Nová faktúra"
        description="Koncept môžeš vystaviť neskôr; PDF až po uložení."
        ledger={
          <>
            <span>Predvolené DPH {company.defaultVatRate}%</span>
            <span>Splatnosť {company.defaultDueDays} dní</span>
            <span>{company.defaultCurrency}</span>
          </>
        }
      />
      <InvoiceForm
        customers={customers.items.map((c) => ({ id: c.id, name: c.name }))}
        defaultCustomerId={sp.customerId}
        companyDefaults={{
          defaultVatRate: company.defaultVatRate,
          defaultCurrency: company.defaultCurrency,
          defaultPaymentMethod: company.defaultPaymentMethod,
          bankIban: company.bankIban,
          bankBic: company.bankBic,
          defaultDueDays: company.defaultDueDays,
        }}
      />
    </div>
  );
}
