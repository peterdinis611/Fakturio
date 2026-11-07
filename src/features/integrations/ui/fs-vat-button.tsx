"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupFsVatAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  ico: string | null | undefined;
  onFound?: (data: {
    isVatPayer: boolean;
    dic?: string;
    icDph?: string;
  }) => void;
};

export function FsVatButton({ ico, onFound }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const value = (ico ?? "").replace(/\D/g, "");

  function run() {
    if (value.length !== 8) {
      toast.error(t("fsNeedIco"));
      return;
    }
    startTransition(async () => {
      const result = await lookupFsVatAction({ ico: value });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("fsFailed"));
        return;
      }
      onFound?.({
        isVatPayer: result.data.isVatPayer,
        dic: result.data.dic ?? undefined,
        icDph: result.data.icDph ?? undefined,
      });
      toast.success(
        result.data.isVatPayer
          ? t("fsVatYes", { icDph: result.data.icDph ?? "—" })
          : t("fsVatNo"),
      );
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 shrink-0 px-2.5"
      disabled={pending || value.length !== 8}
      onClick={run}
    >
      {pending ? <Spinner size="sm" label={t("fsChecking")} /> : t("fsCheck")}
    </Button>
  );
}
