"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupLeiAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { LeiLookup } from "@/shared/api/types";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  ico: string | null | undefined;
  country?: string | null;
};

export function LeiButton({ ico, country }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<LeiLookup | null>(null);
  const value = (ico ?? "").replace(/\D/g, "");
  const jurisdiction = (country ?? "").trim().toUpperCase() || undefined;

  function run() {
    if (value.length !== 8) {
      toast.error(t("leiNeedIco"));
      return;
    }
    startTransition(async () => {
      const result = await lookupLeiAction({
        ico: value,
        jurisdiction,
      });
      if (!result?.data) {
        setSummary(null);
        toast.error(actionErrorMessage(result ?? {}) ?? t("leiFailed"));
        return;
      }
      setSummary(result.data);
      toast.success(
        result.data.found
          ? t("leiFound", { count: result.data.count })
          : t("leiEmpty"),
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
        {pending ? <Spinner size="sm" label={t("leiChecking")} /> : t("leiLookup")}
      </Button>
      {summary ? (
        <div className="rounded-[4px] border border-border bg-raised/40 px-3 py-2 text-[12px] text-muted-foreground">
          <p className="font-medium text-ink">
            {summary.found
              ? t("leiFound", { count: summary.count })
              : t("leiEmpty")}
          </p>
          {summary.records.slice(0, 3).map((r) => (
            <p key={r.lei} className="mt-0.5 text-[11px]">
              · {[r.lei, r.legalName, r.registrationStatus].filter(Boolean).join(" · ")}
              {r.detailUrl ? (
                <>
                  {" "}
                  <a
                    href={r.detailUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline-offset-2 hover:underline"
                  >
                    GLEIF
                  </a>
                </>
              ) : null}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
