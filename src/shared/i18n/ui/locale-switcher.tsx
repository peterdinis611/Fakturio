"use client";

import { ChevronDown, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

type LocaleSwitcherProps = {
  className?: string;
  /** @deprecated Prefer `variant="pills"`. Kept for existing call sites. */
  compact?: boolean;
  variant?: "dropdown" | "pills";
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  /** Smaller trigger for tight headers. */
  size?: "sm" | "default";
  /** full = icon+code+chevron; code = EN▾; icon = languages glyph only */
  trigger?: "full" | "code" | "icon";
};

export function LocaleSwitcher({
  className,
  compact,
  variant,
  align = "end",
  side = "bottom",
  size = "sm",
  trigger = "full",
}: LocaleSwitcherProps) {
  const mode = variant ?? (compact ? "pills" : "dropdown");
  const t = useTranslations("Locale");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const setLocale = (next: string) => {
    const code = next as AppLocale;
    if (code === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: code });
    });
  };

  if (mode === "pills") {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={trigger === "icon" ? "icon-sm" : size === "sm" ? "sm" : "default"}
          disabled={pending}
          aria-label={`${t("label")}: ${t(locale)}`}
          title={`${t("label")}: ${t(locale)}`}
          className={cn(
            "shrink-0 font-medium tabular-nums",
            trigger !== "icon" && "gap-1.5",
            size === "sm" && trigger !== "icon" && "h-8 px-2 text-[12px]",
            className,
          )}
        >
          {trigger === "icon" ? (
            <Languages className="size-3.5" strokeWidth={1.75} aria-hidden />
          ) : trigger === "code" ? (
            <>
              <span className="uppercase tracking-wide">{locale}</span>
              <ChevronDown className="size-3 opacity-50" strokeWidth={1.75} aria-hidden />
            </>
          ) : (
            <>
              <Languages className="size-3.5 opacity-70" strokeWidth={1.75} aria-hidden />
              <span className="uppercase tracking-wide">{locale}</span>
              <ChevronDown className="size-3.5 opacity-50" strokeWidth={1.75} aria-hidden />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={6}
        className="min-w-[11.5rem] rounded-[6px] p-1.5"
      >
        <DropdownMenuLabel className="flex items-center gap-1.5 px-2 text-[11px]">
          <Languages className="size-3 opacity-70" strokeWidth={1.5} aria-hidden />
          {t("label")}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={locale} onValueChange={setLocale}>
          {routing.locales.map((code) => (
            <DropdownMenuRadioItem
              key={code}
              value={code}
              disabled={pending}
              className="rounded-[4px] gap-1.5 py-1.5"
            >
              <span className="font-medium tracking-wide text-ink uppercase">
                {code}
              </span>
              <span className="text-muted-foreground">· {t(code)}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
