"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CreateCustomerDialog } from "@/features/customers/ui/create-customer-dialog";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";

/** Shown when creating an invoice but no customers exist yet. */
export function NewInvoiceNeedsCustomer() {
  const t = useTranslations("InvoiceDetail");
  const router = useRouter();

  return (
    <div className="space-y-4">
      <EmptyState
        title={t("gateTitle")}
        description="Faktúra potrebuje odberateľa: vytvor ho tu a pokračuj vo faktúre."
      />
      <CreateCustomerDialog
        trigger={<Button type="button">{t("gateCta")}</Button>}
        onCreated={(customer) => {
          router.push(`/invoices/new?customerId=${customer.id}`);
          router.refresh();
        }}
      />
    </div>
  );
}
