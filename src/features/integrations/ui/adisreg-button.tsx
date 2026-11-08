"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupAdisregAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { AdisregStatus } from "@/shared/api/types";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  dic: string | null | undefined;
};

export function AdisregButton({ dic }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<AdisregStatus | null>(null);
  const value = (dic ?? "").replace(/^CZ/i, "").replace(/\D/g, "");

  function run() {
    if (value.length < 8 || value.length > 10) {
      toast.error(t("adisNeedDic"));
      return;
    }
    startTransition(async () => {
      const result = await lookupAdisregAction({ dic: value });
      if (!result?.data) {
        setSummary(null);
        toast.error(actionErrorMessage(result ?? {}) ?? t("adisFailed"));
        return;
      }
      setSummary(result.data);
      if (!result.data.found) {
        toast.success(t("adisNotFound"));
      } else if (result.data.isUnreliable) {
        toast.error(t("adisUnreliable"));
      } else {
        toast.success(t("adisReliable", { count: result.data.accounts.length }));
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2.5 text-[12px]"
        disabled={pending || value.length < 8 || value.length > 10}
        onClick={run}
      >
        {pending ? <Spinner size="sm" label={t("adisChecking")} /> : t("adisCheck")}
      </Button>
      {summary ? (
        <div className="rounded-[4px] border border-border bg-raised/40 px-3 py-2 text-[12px] text-muted-foreground">
          <p className="font-medium text-ink">
            {summary.found
              ? summary.isUnreliable
                ? t("adisUnreliable")
                : t("adisReliableLabel")
              : t("adisNotFound")}
          </p>
          {summary.taxOfficeCode ? (
            <p className="mt-0.5 data-num">FÚ {summary.taxOfficeCode}</p>
          ) : null}
          {summary.accounts.slice(0, 4).map((a) => (
            <p key={`${a.account}-${a.bankCode}`} className="mt-0.5 data-num text-[11px]">
              · {a.account}
              {a.bankCode ? ` / ${a.bankCode}` : ""}
            </p>
          ))}
          {summary.accounts.length > 4 ? (
            <p className="mt-0.5 text-[11px]">
              {t("adisMoreAccounts", { count: summary.accounts.length - 4 })}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
