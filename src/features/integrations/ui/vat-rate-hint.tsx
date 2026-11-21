"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getEuVatRatesAction } from "@/features/integrations/api/integrations";
import type { EuVatRates } from "@/shared/api/types";

type Props = {
  /** Customer country (ISO-2). */
  country: string | null | undefined;
  /** When set, renders a small action to apply the standard rate. */
  onApply?: (rate: number) => void;
  disabled?: boolean;
};

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
}

export function VatRateHint({ country, onApply, disabled }: Props) {
  const t = useTranslations("Registry");
  const cc = (country ?? "").trim().toUpperCase();
  const [data, setData] = useState<EuVatRates | null>(null);

  useEffect(() => {
    if (cc.length !== 2) return;
    let cancelled = false;
    void getEuVatRatesAction({ country: cc }).then((result) => {
      if (cancelled) return;
      setData(result?.data ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [cc]);

  if (cc.length !== 2 || !data) return null;

  const match = data.countries.find((c) => c.country.toUpperCase() === cc);
  const standard = data.standard ?? match?.standard ?? null;
  const reduced = (data.reduced?.length ? data.reduced : match?.reduced) ?? [];

  if (standard == null) return null;

  return (
    <p className="text-[11px] text-muted-foreground">
      {t("vatRateHint", { country: cc, standard: fmt(standard) })}
      {reduced.length > 0
        ? t("vatRateHintReduced", { rates: reduced.map(fmt).join(" / ") })
        : null}
      {onApply ? (
        <>
          {" · "}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onApply(standard)}
            className="font-medium text-ink underline underline-offset-2 disabled:opacity-50"
          >
            {t("vatRateApply", { rate: fmt(standard) })}
          </button>
        </>
      ) : null}
    </p>
  );
}
