"use client";

import {
  ChevronsUpDown,
  Languages,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "@teispace/next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useRouter as useNextRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { logoutAction } from "@/actions/auth";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function initialsFromEmail(email?: string | null) {
  if (!email) return "?";
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[._+-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function SidebarAccount({ email }: { email?: string | null }) {
  const t = useTranslations("Common");
  const tn = useTranslations("Nav");
  const tl = useTranslations("Locale");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const nextRouter = useNextRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [pendingLocale, startLocale] = useTransition();
  const [pendingLogout, startLogout] = useTransition();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const displayName = email?.split("@")[0] ?? t("account");

  function setLocale(next: string) {
    const code = next as AppLocale;
    if (code === locale) return;
    startLocale(() => {
      router.replace(pathname, { locale: code });
    });
  }

  function logout() {
    startLogout(async () => {
      await logoutAction();
      nextRouter.replace("/sign-in");
      nextRouter.refresh();
    });
  }

  return (
    <div className="border-t border-sidebar-border p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2.5 rounded-[4px] px-2 py-2 text-left transition-colors",
              "hover:bg-raised/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15",
              "data-[state=open]:bg-raised/80",
            )}
          >
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center border border-border bg-ground text-[11px] font-semibold tracking-wide text-ink"
            >
              {initialsFromEmail(email)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium leading-tight text-ink">
                {displayName}
              </span>
              {email ? (
                <span className="mt-0.5 block truncate text-[11px] leading-tight text-muted-foreground">
                  {email}
                </span>
              ) : null}
            </span>
            <ChevronsUpDown
              className="size-3.5 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={8}
          className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0 rounded-[6px] p-1.5"
        >
          <div className="px-2 py-2">
            <p className="truncate text-[13px] font-medium text-ink">{displayName}</p>
            {email ? (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {email}
              </p>
            ) : null}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="rounded-[4px] gap-2 py-1.5">
              <Link href="/profile">
                <UserRound strokeWidth={1.5} />
                {tn("profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-[4px] gap-2 py-1.5">
              <Link href="/settings">
                <Settings strokeWidth={1.5} />
                {tn("settings")}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="flex items-center gap-1.5 px-2 text-[11px]">
            <Languages className="size-3 opacity-70" strokeWidth={1.5} />
            {tl("label")}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup value={locale} onValueChange={setLocale}>
            {routing.locales.map((code) => (
              <DropdownMenuRadioItem
                key={code}
                value={code}
                disabled={pendingLocale}
                className="rounded-[4px] py-1.5"
              >
                <span className="font-medium tracking-wide uppercase">{code}</span>
                <span className="text-muted-foreground">· {tl(code)}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="px-2 text-[11px]">
            {isDark ? t("themeDark") : t("themeLight")}
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="rounded-[4px] gap-2 py-1.5"
            disabled={!mounted}
            onSelect={(e) => {
              e.preventDefault();
              setTheme(isDark ? "light" : "dark");
            }}
          >
            {isDark ? (
              <Sun strokeWidth={1.5} />
            ) : (
              <Moon strokeWidth={1.5} />
            )}
            {isDark ? t("themeEnableLight") : t("themeEnableDark")}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            disabled={pendingLogout}
            className="rounded-[4px] gap-2 py-1.5"
            onSelect={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            <LogOut strokeWidth={1.5} />
            {t("signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
