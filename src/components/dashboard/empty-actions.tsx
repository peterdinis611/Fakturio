"use client";

import Link from "next/link";
import { CreateCustomerDialog } from "@/components/customers/create-customer-dialog";
import { Button } from "@/components/ui/button";

export function DashboardEmptyActions() {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
      <Button asChild>
        <Link href="/invoices/new">Nová faktúra</Link>
      </Button>
      <CreateCustomerDialog
        trigger={
          <button
            type="button"
            className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
          >
            Pridať zákazníka
          </button>
        }
      />
      <Link
        href="/settings"
        className="text-[13px] text-muted-foreground underline-offset-2 hover:underline"
      >
        Nastavenia
      </Link>
    </div>
  );
}
