import { notFound } from "next/navigation";
import { getCustomer } from "@/features/customers/api/customers";
import { CustomerForm } from "@/features/customers/ui/customer-form";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { isApiError } from "@/shared/api/errors";

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
