"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { emailTypoHintAction } from "@/features/integrations/api/integrations";

type Props = {
  email: string;
  onSuggest?: (suggested: string) => void;
};

export function EmailTypoHint({ email, onSuggest }: Props) {
  const t = useTranslations("Registry");
  const [hint, setHint] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const lastChecked = useRef("");

  useEffect(() => {
    const value = email.trim();
    if (value.length < 6 || !value.includes("@")) {
      setHint(null);
      return;
    }
    if (value === lastChecked.current)
      return;

    const timer = window.setTimeout(() => {
      lastChecked.current = value;
      startTransition(async () => {
        const result = await emailTypoHintAction({ email: value });
        if (!result?.data?.hasSuggestion || !result.data.suggestedEmail) {
          setHint(null);
          return;
        }
        setHint(result.data.suggestedEmail);
      });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [email]);

  if (!hint || pending)
    return null;

  return (
    <p className="text-[11px] text-muted-foreground">
      {t("emailTypoHint")}{" "}
      <button
        type="button"
        className="font-medium text-ink underline underline-offset-2"
        onClick={() => onSuggest?.(hint)}
      >
        {hint}
      </button>
    </p>
  );
}