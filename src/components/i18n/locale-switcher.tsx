"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type LocaleSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function LocaleSwitcher({ className, compact }: LocaleSwitcherProps) {
  const t = useTranslations("Locale");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const setLocale = (next: AppLocale) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div
      className={cn("locale-switcher", className)}
      role="group"
      aria-label={t("label")}
    >
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          className={cn(
            "locale-switcher-btn",
            locale === code && "is-active",
            pending && "is-pending",
          )}
          aria-pressed={locale === code}
          disabled={pending}
          onClick={() => setLocale(code)}
          title={t(code)}
        >
          {compact ? code.toUpperCase() : t(code)}
        </button>
      ))}
    </div>
  );
}
