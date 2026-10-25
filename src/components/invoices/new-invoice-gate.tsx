"use client";

import { useRouter } from "next/navigation";
import { CreateCustomerDialog } from "@/components/customers/create-customer-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

/** Shown when creating an invoice but no customers exist yet. */
export function NewInvoiceNeedsCustomer() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <EmptyState
        title="Najprv pridaj zákazníka"
        description="Faktúra potrebuje odberateľa: vytvor ho tu a pokračuj vo faktúre."
      />
      <CreateCustomerDialog
        trigger={<Button type="button">Pridať zákazníka</Button>}
        onCreated={(customer) => {
          router.push(`/invoices/new?customerId=${customer.id}`);
          router.refresh();
        }}
      />
    </div>
  );
}
