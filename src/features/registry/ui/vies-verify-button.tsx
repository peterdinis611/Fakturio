"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { verifyVatAction } from "@/features/registry/api/registry";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/lib/utils";

type Props = {
  vat: string | null | undefined;
  className?: string;
};

export function ViesVerifyButton({ vat, className }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const value = (vat ?? "").trim();
  const canVerify = value.length >= 4;

  function verify() {
    if (!canVerify) {
      toast.error(t("viesNeedVat"));
      return;
    }
    startTransition(async () => {
      const result = await verifyVatAction({ vat: value });
      if (!result?.data) {
        setStatus("idle");
        toast.error(actionErrorMessage(result ?? {}) ?? t("viesFailed"));
        return;
      }
      if (result.data.isValid) {
        setStatus("valid");
        toast.success(
          result.data.name
            ? t("viesValidNamed", { name: result.data.name })
            : t("viesValid"),
        );
      } else {
        setStatus("invalid");
        toast.error(t("viesInvalid"));
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-9 shrink-0 gap-1.5 px-2.5", className)}
      disabled={pending || !canVerify}
      onClick={verify}
      aria-label={t("viesVerify")}
    >
      {pending ? (
        <Spinner size="sm" label={t("viesChecking")} />
      ) : status === "valid" ? (
        <>
          <ShieldCheck className="size-3.5 text-positive" aria-hidden />
          {t("viesOk")}
        </>
      ) : status === "invalid" ? (
        <>
          <ShieldAlert className="size-3.5 text-negative" aria-hidden />
          {t("viesBad")}
        </>
      ) : (
        t("viesVerify")
      )}
    </Button>
  );
}
