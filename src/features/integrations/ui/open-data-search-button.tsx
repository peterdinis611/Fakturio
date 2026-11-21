"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { searchOpenDataAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { OpenDataSearch } from "@/shared/api/types";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  query: string | null | undefined;
  country?: string | null;
};

export function OpenDataSearchButton({ query, country }: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<OpenDataSearch | null>(null);
  const q = (query ?? "").trim();

  function run() {
    if (q.length < 2) {
      toast.error(t("openDataNeedQuery"));
      return;
    }
    startTransition(async () => {
      const res = await searchOpenDataAction({
        q,
        country: country || undefined,
      });
      if (!res?.data) {
        setResult(null);
        toast.error(actionErrorMessage(res ?? {}) ?? t("openDataFailed"));
        return;
      }
      setResult(res.data);
      if (res.data.datasets.length > 0) {
        toast.success(t("openDataFound", { count: res.data.datasets.length }));
      } else {
        toast.message(t("openDataEmpty"));
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
        disabled={pending || q.length < 2}
        onClick={run}
      >
        {pending ? (
          <Spinner size="sm" label={t("openDataChecking")} />
        ) : (
          t("openDataLookup")
        )}
      </Button>
      {result && result.datasets.length > 0 ? (
        <div className="rounded-[4px] border border-border bg-raised/40 px-3 py-2 text-[12px] text-muted-foreground">
          {result.datasets.slice(0, 5).map((r, i) => (
            <p key={`${r.title}-${i}`} className="mt-0.5 line-clamp-1 text-[11px]">
              ·{" "}
              {r.url ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {r.title ?? r.url}
                </a>
              ) : (
                (r.title ?? "—")
              )}
              {r.organization ? ` — ${r.organization}` : ""}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
