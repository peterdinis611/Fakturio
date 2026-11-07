"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import type { UseFormRegisterReturn } from "react-hook-form";
import { lookupIbanAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/lib/utils";

type Props = {
  id: string;
  register: UseFormRegisterReturn;
  value: string;
  onResolved: (data: { bankName?: string; bic?: string; iban: string }) => void;
  "aria-invalid"?: boolean;
  className?: string;
  disabled?: boolean;
};

export function IbanLookupField({
  id,
  register,
  value,
  onResolved,
  "aria-invalid": ariaInvalid,
  className,
  disabled,
}: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const { onBlur, ...rest } = register;

  function lookup(raw: string) {
    const iban = raw.replace(/\s+/g, "");
    if (iban.length < 15) return;
    startTransition(async () => {
      const result = await lookupIbanAction({ iban });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("ibanFailed"));
        return;
      }
      onResolved({
        iban: result.data.iban,
        bankName: result.data.bankName ?? undefined,
        bic: result.data.bic ?? undefined,
      });
      toast.success(
        result.data.bankName
          ? t("ibanFilled", { bank: result.data.bankName })
          : t("ibanValid"),
      );
    });
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        id={id}
        className="data-num min-w-0 flex-1"
        aria-invalid={ariaInvalid}
        aria-busy={pending || undefined}
        disabled={disabled}
        {...rest}
        onBlur={(e) => {
          onBlur(e);
          if (!disabled) lookup(e.target.value || value);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 shrink-0 px-2.5"
        disabled={
          disabled || pending || value.replace(/\s+/g, "").length < 15
        }
        onClick={() => lookup(value)}
      >
        {pending ? <Spinner size="sm" label={t("ibanChecking")} /> : t("ibanFill")}
      </Button>
    </div>
  );
}
