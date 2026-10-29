"use client";

import { BriefcaseBusiness, Building2, Palette } from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/settings/company", label: "Firma", icon: Building2 },
  { href: "/settings/appearance", label: "Vzhľad", icon: Palette },
  { href: "/settings/jobs", label: "Joby", icon: BriefcaseBusiness },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sekcie nastavení"
      className="mb-6 grid grid-cols-3 gap-1 rounded-[6px] border border-border bg-raised/35 p-1"
    >
      {tabs.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-[4px] px-2 py-2 text-[13px] transition-colors sm:px-3",
              active
                ? "bg-surface font-medium text-ink shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:bg-surface/60 hover:text-ink",
            )}
          >
            <Icon className="size-3.5 opacity-70" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
