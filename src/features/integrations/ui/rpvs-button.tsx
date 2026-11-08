"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupRpvsAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { RpvsStatus } from "@/shared/api/types";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  ico: string | null | undefined;
};

export function RpvsButton({ ico }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<RpvsStatus | null>(null);
  const value = (ico ?? "").replace(/\D/g, "");

  function run() {
    if (value.length !== 8) {
      toast.error(t("rpvsNeedIco"));
      return;
    }
    startTransition(async () => {
      const result = await lookupRpvsAction({ ico: value });
      if (!result?.data) {
        setSummary(null);
        toast.error(actionErrorMessage(result ?? {}) ?? t("rpvsFailed"));
        return;
      }
      setSummary(result.data);
      toast.success(
        result.data.isRegistered
          ? t("rpvsRegistered", { name: result.data.name ?? value })
          : t("rpvsNotRegistered"),
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
        {pending ? <Spinner size="sm" label={t("rpvsChecking")} /> : t("rpvsLookup")}
      </Button>
      {summary ? (
        <div className="rounded-[4px] border border-border bg-raised/40 px-3 py-2 text-[12px] text-muted-foreground">
          <p className="font-medium text-ink">
            {summary.isRegistered
              ? t("rpvsRegistered", { name: summary.name ?? summary.ico })
              : t("rpvsNotRegistered")}
          </p>
          {summary.fileNumber != null ? (
            <p className="mt-0.5 text-[11px]">{t("rpvsFile", { number: summary.fileNumber })}</p>
          ) : null}
          {summary.beneficialOwners.slice(0, 5).map((o, i) => (
            <p key={`${o.name}-${i}`} className="mt-0.5 text-[11px]">
              · {o.name}
              {o.isPublicOfficial ? ` · ${t("rpvsPublicOfficial")}` : ""}
            </p>
          ))}
          {summary.portalUrl ? (
            <a
              href={summary.portalUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-[11px] text-accent underline-offset-2 hover:underline"
            >
              {t("rpvsPortal")}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
