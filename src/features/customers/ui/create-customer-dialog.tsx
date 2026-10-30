"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("CustomerDetail");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button type="button">{t("add")}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
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
