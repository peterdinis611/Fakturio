"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { validatePostalAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  code: string | null | undefined;
  country?: string | null;
  city?: string | null;
  onValidated?: (data: { postalCode?: string; city?: string }) => void;
};

export function PostalValidateButton({
  code,
  country = "SK",
  city,
  onValidated,
}: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const digits = (code ?? "").replace(/\D/g, "");
  const cc = (country || "SK").toUpperCase();
  const supported = cc === "SK" || cc === "CZ";

  function run() {
    if (!supported) {
      toast.error(t("postalUnsupported"));
      return;
    }
    if (digits.length !== 5) {
      toast.error(t("postalNeedCode"));
      return;
    }
    startTransition(async () => {
      const result = await validatePostalAction({
        code: digits,
        country: cc,
        city: city?.trim() || undefined,
      });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("postalFailed"));
        return;
      }
      if (!result.data.exists) {
        toast.error(t("postalMissing"));
        return;
      }
      if (!result.data.isValid) {
        toast.error(
          t("postalCityMismatch", {
            city: result.data.city ?? "—",
          }),
        );
        return;
      }
      onValidated?.({
        postalCode: result.data.normalizedCode ?? undefined,
        city: result.data.city ?? undefined,
      });
      toast.success(
        t("postalOk", {
          code: result.data.normalizedCode ?? digits,
          city: result.data.city ?? "—",
        }),
      );
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 shrink-0 px-2.5 text-[12px]"
      disabled={pending || !supported || digits.length !== 5}
      onClick={run}
    >
      {pending ? <Spinner size="sm" label={t("postalChecking")} /> : t("postalValidate")}
    </Button>
  );
}
