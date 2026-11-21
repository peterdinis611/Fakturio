"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { lookupCzJusticePdfAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { CzJusticePdf } from "@/shared/api/types";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  /** Czech IČO only — render this button for country CZ. */
  ico: string | null | undefined;
};

export function CzJusticePdfButton({ ico }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<CzJusticePdf | null>(null);
  const value = (ico ?? "").replace(/\D/g, "");

  function run() {
    if (value.length !== 8) {
      toast.error(t("czPdfNeedIco"));
      return;
    }
    startTransition(async () => {
      const res = await lookupCzJusticePdfAction({ ico: value });
      if (!res?.data) {
        setResult(null);
        toast.error(actionErrorMessage(res ?? {}) ?? t("czPdfFailed"));
        return;
      }
      setResult(res.data);
      if (res.data.links.length > 0) {
        toast.success(t("czPdfFound", { count: res.data.links.length }));
      } else {
        toast.message(t("czPdfEmpty"));
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
        disabled={pending || value.length !== 8}
        onClick={run}
      >
        {pending ? (
          <Spinner size="sm" label={t("czPdfChecking")} />
        ) : (
          t("czPdfLookup")
        )}
      </Button>
      {result ? (
        <div className="rounded-[4px] border border-border bg-raised/40 px-3 py-2 text-[12px] text-muted-foreground">
          {result.links.slice(0, 6).map((d, i) => (
            <a
              key={`${d.url}-${i}`}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 line-clamp-1 block text-[11px] underline underline-offset-2"
            >
              · {d.title || d.url}
            </a>
          ))}
          {result.links.length === 0 ? (
            <p className="text-[11px]">{t("czPdfEmpty")}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
