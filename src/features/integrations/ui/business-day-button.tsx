"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { businessDayAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  from: string | null | undefined;
  addDays?: number;
  country?: string | null;
  onResult: (isoDate: string) => void;
};

export function BusinessDayButton({
  from,
  addDays = 0,
  country = "SK",
  onResult,
}: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const date = (from ?? "").trim();
  const cc = (country || "SK").toUpperCase();
  const supported = cc === "SK" || cc === "CZ";

  function run() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      toast.error(t("businessDayNeedDate"));
      return;
    }
    if (!supported) {
      toast.error(t("businessDayUnsupported"));
      return;
    }
    startTransition(async () => {
      const result = await businessDayAction({
        from: date,
        addDays,
        country: cc,
      });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("businessDayFailed"));
        return;
      }
      onResult(result.data.result);
      toast.success(
        result.data.adjusted
          ? t("businessDayAdjusted", { date: result.data.result })
          : t("businessDayOk", { date: result.data.result }),
      );
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 shrink-0 px-2.5 text-[12px]"
      disabled={pending || !supported || !/^\d{4}-\d{2}-\d{2}$/.test(date)}
      onClick={run}
    >
      {pending ? (
        <Spinner size="sm" label={t("businessDayChecking")} />
      ) : (
        t("businessDayApply")
      )}
    </Button>
  );
}
