"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupObchodnyVestnikAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  ico: string | null | undefined;
};

export function ObchodnyVestnikButton({ ico }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const value = (ico ?? "").replace(/\D/g, "");

  function run() {
    if (value.length !== 8) {
      toast.error(t("obNeedIco"));
      return;
    }
    startTransition(async () => {
      const result = await lookupObchodnyVestnikAction({ ico: value });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("obFailed"));
        return;
      }
      if (result.data.found) {
        toast.success(result.data.name ? t("obFound", { name: result.data.name }) : t("obFoundGeneric"));
      } else {
        toast.success(t("obNotFound"));
      }
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
      {pending ? <Spinner size="sm" label={t("obChecking")} /> : t("obLookup")}
    </Button>
  );
}