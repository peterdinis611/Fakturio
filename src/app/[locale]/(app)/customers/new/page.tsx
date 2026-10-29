import { PageHeader } from "@/widgets/app-shell/page-header";
import { CustomerForm } from "@/features/customers/ui/customer-form";

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
