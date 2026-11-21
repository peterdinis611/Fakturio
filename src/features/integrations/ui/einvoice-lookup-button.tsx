"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupMfEinvoiceAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { MfEinvoiceLookup } from "@/shared/api/types";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  ico: string | null | undefined;
};

export function EinvoiceLookupButton({ ico }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<MfEinvoiceLookup | null>(null);
  const value = (ico ?? "").replace(/\D/g, "");

  function run() {
    if (value.length !== 8) {
      toast.error(t("einvoiceNeedIco"));
      return;
    }
    startTransition(async () => {
      const res = await lookupMfEinvoiceAction({ ico: value });
      if (!res?.data) {
        setResult(null);
        toast.error(actionErrorMessage(res ?? {}) ?? t("einvoiceFailed"));
        return;
      }
      setResult(res.data);
      if (res.data.found && res.data.invoices.length > 0) {
        toast.success(
          t("einvoiceRegistered", {
            name: ` · ${res.data.invoices.length}`,
          }),
        );
      } else {
        toast.message(t("einvoiceNotRegistered"));
      }
    });
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2.5 text-[12px]"
        disabled={pending || value.length !== 8}
        onClick={run}
      >
        {pending ? (
          <Spinner size="sm" label={t("einvoiceChecking")} />
        ) : (
          t("einvoiceLookup")
        )}
      </Button>
      {result?.invoices?.slice(0, 3).map((inv, i) => (
        <p key={`${inv.id}-${i}`} className="text-[11px] text-muted-foreground">
          · {[inv.format, inv.supplierName ?? inv.customerName, inv.issuedAt]
            .filter(Boolean)
            .join(" · ")}
        </p>
      ))}
    </div>
  );
}
