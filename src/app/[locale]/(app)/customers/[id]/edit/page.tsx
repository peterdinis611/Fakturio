import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCustomer } from "@/features/customers/api/customers";
import { CustomerForm } from "@/features/customers/ui/customer-form";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { isApiError } from "@/shared/api/errors";

export async function generateMetadata() {
  const t = await getTranslations("CustomerDetail");
  return { title: t("editTitle") };
}

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("CustomerDetail");
  const { id } = await params;
  let customer;
  try {
    customer = await getCustomer(id);
  } catch (e) {
    if (isApiError(e) && e.status === 404) notFound();
    throw e;
  }

  return (
    <div>
      <PageHeader title={`${t("editTitle")} · ${customer.name}`} />
      <CustomerForm initial={customer} customerId={id} />
    </div>
  );
}
