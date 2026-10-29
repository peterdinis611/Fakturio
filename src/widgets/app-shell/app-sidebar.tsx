"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  BookOpen,
  FileText,
  IdCard,
  LayoutDashboard,
  Menu,
  Bell,
  NotebookPen,
  ScrollText,
  Search,
  Settings,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { NavLink } from "@/widgets/app-shell/nav-link";
import { SidebarAccount } from "@/widgets/app-shell/sidebar-account";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";

const navKeys = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/invoices", key: "invoices", icon: FileText },
  { href: "/customers", key: "customers", icon: Users },
  { href: "/services", key: "services", icon: BookOpen },
  { href: "/zivotopis", key: "resume", icon: IdCard },
  { href: "/notes", key: "notes", icon: NotebookPen },
  { href: "/payments/import", key: "payments", icon: Wallet },
  { href: "/reminders", key: "reminders", icon: Bell },
  { href: "/logs", key: "logs", icon: ScrollText },
  { href: "/reports", key: "reports", icon: BarChart3 },
  { href: "/search", key: "search", icon: Search },
  { href: "/profile", key: "profile", icon: UserRound },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("Nav");

  return (
    <nav className="flex flex-1 flex-col gap-px px-2">
      {navKeys.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <NavLink
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            active={active}
            className={cn(
              "flex h-9 items-center gap-2.5 px-2.5 text-[14px] transition-colors duration-150",
              active
                ? "bg-active font-medium text-ink"
                : "text-muted-foreground hover:bg-raised/80 hover:text-ink",
            )}
          >
            {active ? (
              <span
                aria-hidden
                className="absolute inset-y-1.5 left-0 w-0.5 bg-ink"
              />
            ) : null}
            <Icon className="size-4 shrink-0 opacity-70" strokeWidth={1.5} />
            {t(item.key)}
          </NavLink>
        );
      })}
    </nav>
  );
}

function Brand({ companyName }: { companyName?: string }) {
  return (
    <Link href="/dashboard" className="block px-4 py-5">
      <div className="flex items-center gap-2.5">
        <span className="stamp" aria-hidden>
          F
        </span>
        <span className="text-[16px] font-semibold text-ink">Fakturio</span>
      </div>
      {companyName ? (
        <p className="mt-1.5 truncate text-[12px] text-muted-foreground">
          {companyName}
        </p>
      ) : null}
    </Link>
  );
}

export function AppSidebar({
  companyName,
  userEmail,
}: {
  companyName?: string;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const tc = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <>
      <div className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 text-ink">
          <span className="stamp" aria-hidden>
            F
          </span>
          <span className="text-[15px] font-semibold">Fakturio</span>
        </Link>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center text-muted-foreground hover:bg-raised hover:text-ink"
          aria-expanded={open}
          aria-label={open ? tc("closeMenu") : tc("openMenu")}
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
              className="absolute inset-0 bg-ink/25"
              aria-label={tc("closeMenu")}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-[min(100%,14rem)] flex-col border-r border-sidebar-border bg-sidebar"
              initial={reduce ? false : { x: -20 }}
              animate={{ x: 0 }}
              exit={{ x: -20 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Brand companyName={companyName} />
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
              <div className="mt-auto">
                <SidebarAccount email={userEmail} />
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <aside className="sticky top-0 hidden h-svh w-[var(--sidebar-width)] shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <Brand companyName={companyName} />
        <NavLinks pathname={pathname} />
        <div className="mt-auto">
          <SidebarAccount email={userEmail} />
        </div>
      </aside>
    </>
  );
}
