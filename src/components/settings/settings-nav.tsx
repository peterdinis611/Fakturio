"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/settings/company", label: "Firma" },
  { href: "/settings/appearance", label: "Vzhľad" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sekcie nastavení"
      className="mb-6 flex flex-wrap gap-1 border-b border-border"
    >
      {tabs.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative -mb-px px-3 pb-2.5 pt-1 text-[14px] transition-colors",
              active
                ? "font-medium text-ink"
                : "text-muted-foreground hover:text-ink",
            )}
          >
            {tab.label}
            {active ? (
              <span
                aria-hidden
                className="absolute inset-x-3 bottom-0 h-0.5 bg-ink"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
