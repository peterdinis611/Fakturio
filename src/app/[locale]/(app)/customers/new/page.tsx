import { PageHeader } from "@/components/layout/page-header";
import { CustomerForm } from "@/components/customers/customer-form";

export const metadata = { title: "Nový zákazník" };

export default function NewCustomerPage() {
  return (
    <div>
      <PageHeader
        title="Nový zákazník"
        description="Údaje odberateľa pre faktúry a PDF."
      />
      <CustomerForm />
    </div>
  );
}
