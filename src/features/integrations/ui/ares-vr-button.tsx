"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupAresVrAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { AresVrSummary } from "@/shared/api/types";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  ico: string | null | undefined;
};

export function AresVrButton({ ico }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<AresVrSummary | null>(null);
  const value = (ico ?? "").replace(/\D/g, "");

  function run() {
    if (value.length !== 8) {
      toast.error(t("aresVrNeedIco"));
      return;
    }
    startTransition(async () => {
      const result = await lookupAresVrAction({ ico: value });
      if (!result?.data) {
        setSummary(null);
        toast.error(actionErrorMessage(result ?? {}) ?? t("aresVrFailed"));
        return;
      }
      setSummary(result.data);
      toast.success(
        t("aresVrLoaded", {
          name: result.data.name ?? value,
          count: result.data.officersCount,
        }),
      );
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2.5 text-[12px]"
        disabled={pending || value.length !== 8}
        onClick={run}
      >
        {pending ? <Spinner size="sm" label={t("aresVrChecking")} /> : t("aresVrLookup")}
      </Button>
      {summary ? (
        <div className="rounded-[4px] border border-border bg-raised/40 px-3 py-2 text-[12px] text-muted-foreground">
          <p className="font-medium text-ink">{summary.name ?? summary.ico}</p>
          {summary.courtFile ? (
            <p className="mt-0.5 data-num">{summary.courtFile}</p>
          ) : null}
          {summary.registeredCapital ? (
            <p className="mt-0.5">{t("aresVrCapital", { amount: summary.registeredCapital })}</p>
          ) : null}
          <p className="mt-1 text-[11px]">
            {t("aresVrOfficers", { count: summary.officersCount })}
          </p>
          {summary.officers.slice(0, 5).map((o, i) => (
            <p key={`${o.name}-${i}`} className="mt-0.5 line-clamp-1 text-[11px]">
              · {o.name}
              {o.role ? ` · ${o.role}` : ""}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
