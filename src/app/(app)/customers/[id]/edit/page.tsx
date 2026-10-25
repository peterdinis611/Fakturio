import { notFound } from "next/navigation";
import { getCustomer } from "@/actions/customers";
import { CustomerForm } from "@/components/customers/customer-form";
import { PageHeader } from "@/components/layout/page-header";
import { isApiError } from "@/lib/api/errors";

export const metadata = { title: "Upraviť zákazníka" };

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
      <PageHeader title={`Upraviť · ${customer.name}`} />
      <CustomerForm initial={customer} customerId={id} />
    </div>
  );
}
