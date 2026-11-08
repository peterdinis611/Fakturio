"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupRegistrSmluvAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { RegistrSmluvStatus } from "@/shared/api/types";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  ico: string | null | undefined;
};

export function RegistrSmluvButton({ ico }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<RegistrSmluvStatus | null>(null);
  const value = (ico ?? "").replace(/\D/g, "");

  function run() {
    if (value.length !== 8) {
      toast.error(t("rsNeedIco"));
      return;
    }
    startTransition(async () => {
      const result = await lookupRegistrSmluvAction({ ico: value });
      if (!result?.data) {
        setSummary(null);
        toast.error(actionErrorMessage(result ?? {}) ?? t("rsFailed"));
        return;
      }
      setSummary(result.data);
      toast.success(
        result.data.found
          ? t("rsFound", { count: result.data.totalCount })
          : t("rsEmpty"),
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
        {pending ? <Spinner size="sm" label={t("rsChecking")} /> : t("rsLookup")}
      </Button>
      {summary ? (
        <div className="rounded-[4px] border border-border bg-raised/40 px-3 py-2 text-[12px] text-muted-foreground">
          <p className="font-medium text-ink">
            {summary.found
              ? t("rsFound", { count: summary.totalCount })
              : t("rsEmpty")}
          </p>
          {summary.recent.slice(0, 4).map((c, i) => (
            <p key={`${c.detailUrl}-${i}`} className="mt-0.5 text-[11px]">
              · {[c.subjectName, c.description, c.value, c.publishedAt]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ))}
          <a
            href={summary.portalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-[11px] text-accent underline-offset-2 hover:underline"
          >
            {t("rsPortal")}
          </a>
        </div>
      ) : null}
    </div>
  );
}
