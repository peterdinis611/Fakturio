"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getFxRatesAction } from "@/features/fx/api/fx";
import { intlLocale } from "@/i18n/locales";

type Props = {
  currency: string;
  base?: string;
  /** ISO date yyyy-MM-dd — historical ECB/CNB fixing. */
  date?: string | null;
};

export function FxRateHint({ currency, base = "EUR", date }: Props) {
  const t = useTranslations("Registry");
  const locale = useLocale();
  const code = currency.trim().toUpperCase();
  const baseCode = base.trim().toUpperCase();
  const onDate = date?.trim() || undefined;
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
        date: onDate,
      });
      if (!result?.data?.rates?.[code]) {
        setLine(null);
        return;
      }
      const rate = result.data.rates[code];
      const source = (result.data.source || "ecb").toUpperCase();
      setLine(
        t("fxHint", {
          base: baseCode,
          quote: code,
          rate: rate.toLocaleString(intlLocale(locale), {
            maximumFractionDigits: 4,
          }),
          date: result.data.date,
          source,
        }),
      );
    });
  }, [code, baseCode, onDate, locale, t]);

  if (!line && !pending) return null;

  return (
    <p className="text-[11px] text-muted-foreground">
      {pending && !line ? t("fxLoading") : line}
    </p>
  );
}
