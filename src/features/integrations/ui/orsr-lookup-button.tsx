"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupOrsrAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { OrsrCompanySummary } from "@/shared/api/types";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  ico: string | null | undefined;
};

export function OrsrLookupButton({ ico }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<OrsrCompanySummary | null>(null);
  const value = (ico ?? "").replace(/\D/g, "");

  function run() {
    if (value.length !== 8) {
      toast.error(t("orsrNeedIco"));
      return;
    }
    startTransition(async () => {
      const result = await lookupOrsrAction({ ico: value });
      if (!result?.data) {
        setSummary(null);
        toast.error(actionErrorMessage(result ?? {}) ?? t("orsrFailed"));
        return;
      }
      setSummary(result.data);
      toast.success(t("orsrLoaded", { name: result.data.name }));
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
        {pending ? <Spinner size="sm" label={t("orsrChecking")} /> : t("orsrLookup")}
      </Button>
      {summary ? (
        <div className="rounded-[4px] border border-border bg-raised/40 px-3 py-2 text-[12px] text-muted-foreground">
          <p className="font-medium text-ink">{summary.name}</p>
          {summary.fileReference ? (
            <p className="data-num mt-0.5">{summary.fileReference}</p>
          ) : null}
          {summary.street || summary.cityPostal ? (
            <p className="mt-0.5">
              {[summary.street, summary.cityPostal].filter(Boolean).join(", ")}
            </p>
          ) : null}
          <p className="mt-1 text-[11px]">
            {t("orsrDocs", { count: summary.documentsCount })}
          </p>
          {summary.documents.slice(0, 3).map((d, i) => (
            <p key={`${d.title}-${i}`} className="mt-0.5 line-clamp-1 text-[11px]">
              · {d.title}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
