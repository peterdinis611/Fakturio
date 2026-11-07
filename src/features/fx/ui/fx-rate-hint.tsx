"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { getFxRatesAction } from "@/features/fx/api/fx";

type Props = {
  currency: string;
  base?: string;
};

export function FxRateHint({ currency, base = "EUR" }: Props) {
  const t = useTranslations("Registry");
  const code = currency.trim().toUpperCase();
  const baseCode = base.trim().toUpperCase();
  const [pending, startTransition] = useTransition();
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    if (!code || code === baseCode) {
      setLine(null);
      return;
    }

    startTransition(async () => {
      const result = await getFxRatesAction({
        base: baseCode,
        symbols: code,
      });
      if (!result?.data?.rates?.[code]) {
        setLine(null);
        return;
      }
      const rate = result.data.rates[code];
      setLine(
        t("fxHint", {
          base: baseCode,
          quote: code,
          rate: rate.toLocaleString("sk-SK", {
            maximumFractionDigits: 4,
          }),
          date: result.data.date,
        }),
      );
    });
  }, [code, baseCode, t]);

  if (!line && !pending) return null;

  return (
    <p className="text-[11px] text-muted-foreground">
      {pending && !line ? t("fxLoading") : line}
    </p>
  );
}
