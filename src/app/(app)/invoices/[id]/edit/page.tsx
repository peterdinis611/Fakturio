import { notFound, redirect } from "next/navigation";
import { getCompany } from "@/actions/company";
import { listCustomers } from "@/actions/customers";
import { getInvoice } from "@/actions/invoices";
import { listServices } from "@/actions/services";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { PageHeader } from "@/components/layout/page-header";
import { isApiError } from "@/lib/api/errors";

export const metadata = { title: "Upraviť faktúru" };

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let invoice;
  try {
    invoice = await getInvoice(id);
  } catch (e) {
    if (isApiError(e) && e.status === 404) notFound();
    throw e;
  }

  if (invoice.status !== "Draft") {
    redirect(`/invoices/${id}`);
  }

  const [customers, company, services] = await Promise.all([
    listCustomers({ pageSize: 100 }),
    getCompany(),
    listServices({ pageSize: 100, activeOnly: true }),
  ]);

  return (
    <div>
      <PageHeader title={`Upraviť · ${invoice.number}`} />
      <InvoiceForm
        initial={invoice}
        customers={customers.items.map((c) => ({ id: c.id, name: c.name }))}
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
