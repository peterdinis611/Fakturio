import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCompany } from "@/features/company/api/company";
import { CompanyNotReadyGate } from "@/features/company/ui/company-not-ready-gate";
import { listCustomers } from "@/features/customers/api/customers";
import { getInvoice } from "@/features/invoices/api/invoices";
import { listServices } from "@/features/services/api/services";
import { InvoiceForm } from "@/features/invoices/ui/invoice-form";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { isApiError } from "@/shared/api/errors";

export async function generateMetadata() {
  const t = await getTranslations("InvoiceDetail");
  return { title: t("editTitle") };
}

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("InvoiceDetail");
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

  if (!company.completeness.isReadyToInvoice) {
    return (
      <div>
        <PageHeader title={`${t("editTitle")} · ${invoice.number}`} />
        <CompanyNotReadyGate />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`${t("editTitle")} · ${invoice.number}`} />
      <InvoiceForm
        initial={invoice}
        customers={customers.items.map((c) => ({
          id: c.id,
          name: c.name,
          country: c.country,
          icDph: c.icDph,
        }))}
        catalogItems={services.items}
        defaultFlow={invoice.flow}
        companyDefaults={{
          defaultVatRate: company.defaultVatRate,
          defaultCurrency: company.defaultCurrency,
          defaultPaymentMethod: company.defaultPaymentMethod,
          bankIban: company.bankIban,
          bankBic: company.bankBic,
          defaultDueDays: company.defaultDueDays,
          isVatPayer: company.isVatPayer,
          country: company.country,
        }}
      />
    </div>
  );
}
