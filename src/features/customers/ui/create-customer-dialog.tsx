"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CustomerForm } from "@/features/customers/ui/customer-form";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import type { Customer } from "@/shared/api/types";

type CreateCustomerDialogProps = {
  trigger?: ReactNode;
  /** Called after create; default refreshes the route. */
  onCreated?: (customer: Customer) => void;
};

export function CreateCustomerDialog({
  trigger,
  onCreated,
}: CreateCustomerDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button type="button">Pridať zákazníka</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[min(90vh,40rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nový zákazník</DialogTitle>
          <DialogDescription>
            Údaje odberateľa pre faktúry a PDF. IČO a adresa sa skopírujú pri
            vystavení.
          </DialogDescription>
        </DialogHeader>
        <CustomerForm
          embedded
          onSuccess={(customer) => {
            setOpen(false);
            if (onCreated) {
              onCreated(customer);
            } else {
              router.refresh();
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
