"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupSanctionsAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { SanctionsSearch } from "@/shared/api/types";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  query: string | null | undefined;
};

export function SanctionsButton({ query }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<SanctionsSearch | null>(null);
  const value = (query ?? "").trim();

  function run() {
    if (value.length < 2) {
      toast.error(t("sanctionsNeedQuery"));
      return;
    }
    startTransition(async () => {
      const result = await lookupSanctionsAction({ q: value });
      if (!result?.data) {
        setSummary(null);
        toast.error(actionErrorMessage(result ?? {}) ?? t("sanctionsFailed"));
        return;
      }
      setSummary(result.data);
      toast.success(
        result.data.count > 0
          ? t("sanctionsFound", { count: result.data.count })
          : t("sanctionsClear"),
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
        disabled={pending || value.length < 2}
        onClick={run}
      >
        {pending ? <Spinner size="sm" label={t("sanctionsChecking")} /> : t("sanctionsLookup")}
      </Button>
      {summary && summary.count > 0 ? (
        <div className="rounded-[4px] border border-border bg-raised/40 px-3 py-2 text-[12px] text-muted-foreground">
          {summary.hits.slice(0, 3).map((h) => (
            <p key={h.id ?? h.name} className="mt-0.5 text-[11px]">
              · {h.name}
              {h.countries.length ? ` (${h.countries.join(", ")})` : ""}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}