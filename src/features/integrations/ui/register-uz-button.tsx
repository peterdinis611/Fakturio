"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  lookupRegisterUzAction,
  lookupRegisterUzStatementsAction,
} from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { RegisterUzStatement, RegisterUzUnit } from "@/shared/api/types";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  ico: string | null | undefined;
  onFound?: (data: {
    name?: string;
    dic?: string;
    street?: string;
    city?: string;
    postalCode?: string;
  }) => void;
};

export function RegisterUzButton({ ico, onFound }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<RegisterUzUnit | null>(null);
  const [statements, setStatements] = useState<RegisterUzStatement[]>([]);
  const value = (ico ?? "").replace(/\D/g, "");

  function run() {
    if (value.length !== 8) {
      toast.error(t("ruzNeedIco"));
      return;
    }
    startTransition(async () => {
      const result = await lookupRegisterUzAction({ ico: value });
      if (!result?.data) {
        setSummary(null);
        setStatements([]);
        toast.error(actionErrorMessage(result ?? {}) ?? t("ruzFailed"));
        return;
      }
      setSummary(result.data);
      onFound?.({
        name: result.data.name,
        dic: result.data.dic ?? undefined,
        street: result.data.street ?? undefined,
        city: result.data.city ?? undefined,
        postalCode: result.data.postalCode ?? undefined,
      });

      const stmts = await lookupRegisterUzStatementsAction({ ico: value, take: 5 });
      setStatements(stmts?.data?.statements ?? []);

      toast.success(t("ruzLoaded", { name: result.data.name }));
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
        {pending ? <Spinner size="sm" label={t("ruzChecking")} /> : t("ruzLookup")}
      </Button>
      {summary ? (
        <div className="rounded-[4px] border border-border bg-raised/40 px-3 py-2 text-[12px] text-muted-foreground">
          <p className="font-medium text-ink">{summary.name}</p>
          {summary.street || summary.city || summary.postalCode ? (
            <p className="mt-0.5">
              {[summary.street, [summary.postalCode, summary.city].filter(Boolean).join(" ")]
                .filter(Boolean)
                .join(", ")}
            </p>
          ) : null}
          <p className="mt-1 text-[11px]">
            {t("ruzStatements", { count: summary.statementsCount })}
          </p>
          {statements.slice(0, 5).map((s) => (
            <p key={s.id} className="mt-0.5 text-[11px]">
              · {[s.type, s.periodFrom && s.periodTo ? `${s.periodFrom}–${s.periodTo}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
