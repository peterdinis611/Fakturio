"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupIsirAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { IsirStatus } from "@/shared/api/types";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  ico: string | null | undefined;
};

export function IsirButton({ ico }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<IsirStatus | null>(null);
  const value = (ico ?? "").replace(/\D/g, "");

  function run() {
    if (value.length !== 8) {
      toast.error(t("isirNeedIco"));
      return;
    }
    startTransition(async () => {
      const result = await lookupIsirAction({ ico: value });
      if (!result?.data) {
        setSummary(null);
        toast.error(actionErrorMessage(result ?? {}) ?? t("isirFailed"));
        return;
      }
      setSummary(result.data);
      toast.success(
        result.data.hasProceedings
          ? t("isirFound", { count: result.data.count })
          : t("isirClear"),
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
        {pending ? <Spinner size="sm" label={t("isirChecking")} /> : t("isirLookup")}
      </Button>
      {summary ? (
        <div className="rounded-[4px] border border-border bg-raised/40 px-3 py-2 text-[12px] text-muted-foreground">
          <p className="font-medium text-ink">
            {summary.hasProceedings
              ? t("isirFound", { count: summary.count })
              : t("isirClear")}
          </p>
          {summary.proceedings.slice(0, 3).map((p, i) => (
            <p key={`${p.courtFile}-${i}`} className="mt-0.5 text-[11px]">
              · {[p.courtFile, p.state, p.name].filter(Boolean).join(" · ")}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
