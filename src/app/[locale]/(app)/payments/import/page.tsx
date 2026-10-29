import { PageHeader } from "@/widgets/app-shell/page-header";
import { PaymentImportPanel } from "@/features/payments/ui/payment-import";

export const metadata = { title: "Import platieb" };

export default function PaymentImportPage() {
  return (
    <div>
      <PageHeader
        title="Import platieb"
        description="Nahraj bankový CSV a spáruj platby podľa variabilného symbolu."
      />
      <PaymentImportPanel />
    </div>
  );
}
