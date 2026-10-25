"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  Building2,
  FileText,
  LayoutDashboard,
  Menu,
  Bell,
  Search,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Prehľad", icon: LayoutDashboard },
  { href: "/invoices", label: "Faktúry", icon: FileText },
  { href: "/customers", label: "Zákazníci", icon: Users },
  { href: "/reminders", label: "Upomienky", icon: Bell },
  { href: "/reports", label: "Reporty", icon: BarChart3 },
  { href: "/search", label: "Hľadanie", icon: Search },
  { href: "/settings/company", label: "Firma", icon: Building2 },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-2">
      {nav.map((item, i) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <motion.div
            key={item.href}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.28,
              delay: reduce ? 0 : 0.03 * i,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[14px] transition-colors duration-150",
                active
                  ? "bg-active text-ink"
                  : "text-muted-foreground hover:bg-raised hover:text-ink",
              )}
            >
              <Icon className="size-4 shrink-0 opacity-80" strokeWidth={1.5} />
              {item.label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}

function Brand({ companyName }: { companyName?: string }) {
  return (
    <Link href="/" className="block px-4 py-5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block size-2 shrink-0 bg-ink"
        />
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          Fakturio
        </span>
      </div>
      {companyName ? (
        <p className="mt-1 truncate pl-4 text-[12px] text-muted-foreground">
          {companyName}
        </p>
      ) : null}
    </Link>
  );
}

export function AppSidebar({ companyName }: { companyName?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <>
      {/* Mobile top strip */}
      <div className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-sidebar px-4 md:hidden">
        <Link href="/" className="text-[15px] font-semibold tracking-tight text-ink">
          Fakturio
        </Link>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-[7px] text-muted-foreground hover:bg-raised hover:text-ink"
          aria-expanded={open}
          aria-label={open ? "Zavrieť menu" : "Otvoriť menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-ink/20"
              aria-label="Zavrieť"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-[min(100%,16rem)] flex-col border-r border-sidebar-border bg-sidebar"
              initial={reduce ? false : { x: -24 }}
              animate={{ x: 0 }}
              exit={{ x: -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Brand companyName={companyName} />
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
              <div className="mt-auto space-y-1 border-t border-sidebar-border p-2">
                <ThemeToggle />
                <p className="px-2.5 py-1 text-[11px] text-faint">SK · EUR</p>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-[var(--sidebar-width)] shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <Brand companyName={companyName} />
        <NavLinks pathname={pathname} />
        <div className="mt-auto space-y-1 border-t border-sidebar-border p-2">
          <ThemeToggle />
          <p className="px-2.5 py-1 text-[11px] text-faint">SK · EUR</p>
        </div>
      </aside>
    </>
  );
}
