"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupPeppolAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  ico: string | null | undefined;
};

export function PeppolButton({ ico }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const value = (ico ?? "").replace(/\D/g, "");

  function run() {
    if (value.length !== 8) {
      toast.error(t("peppolNeedIco"));
      return;
    }
    startTransition(async () => {
      const result = await lookupPeppolAction({ ico: value });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("peppolFailed"));
        return;
      }
      toast.success(
        result.data.found
          ? t("peppolFound", { count: result.data.participants.length })
          : t("peppolEmpty"),
      );
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 px-2.5 text-[12px]"
      disabled={pending || value.length !== 8}
      onClick={run}
    >
      {pending ? <Spinner size="sm" label={t("peppolChecking")} /> : t("peppolLookup")}
    </Button>
  );
}