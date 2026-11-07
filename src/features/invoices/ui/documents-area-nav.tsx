"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";

const AREAS = [
  { key: "invoices" as const, href: "/invoices" },
  { key: "expenses" as const, href: "/expenses" },
  { key: "contacts" as const, href: "/customers" },
];

export function DocumentsAreaNav() {
  const t = useTranslations("Documents");
  const pathname = usePathname();

  return (
    <nav aria-label={t("areaAria")} className="mb-0">
      <ul className="flex items-end gap-0 border-b border-border">
        {AREAS.map((area) => {
          const active =
            area.key === "contacts"
              ? pathname.startsWith("/customers")
              : area.key === "expenses"
                ? pathname.startsWith("/expenses")
                : pathname.startsWith("/invoices") ||
                  pathname.startsWith("/recurring");

          return (
            <li key={area.key}>
              <Link
                href={area.href}
                className={cn(
                  "relative block px-4 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase transition-colors",
                  active
                    ? "bg-surface text-signal"
                    : "bg-raised/60 text-muted-foreground hover:text-ink",
                )}
                aria-current={active ? "page" : undefined}
              >
                {t(area.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
