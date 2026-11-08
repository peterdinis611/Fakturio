"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  BookOpen,
  FileText,
  LayoutDashboard,
  Menu,
  Bell,
  NotebookPen,
  Receipt,
  Repeat,
  ScrollText,
  Search,
  Settings,
  Shield,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { NotificationBell } from "@/features/notifications/ui/notification-bell";
import { NavLink } from "@/widgets/app-shell/nav-link";
import { SidebarAccount } from "@/widgets/app-shell/sidebar-account";
import { BrandLockup } from "@/shared/brand/brand-lockup";
import { LocaleSwitcher } from "@/shared/i18n/ui/locale-switcher";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";

const navKeys = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/invoices", key: "invoices", icon: FileText },
  { href: "/expenses", key: "expenses", icon: Receipt },
  { href: "/customers", key: "customers", icon: Users },
  { href: "/services", key: "services", icon: BookOpen },
  { href: "/recurring", key: "recurring", icon: Repeat },
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
  isAdmin,
}: {
  pathname: string;
  onNavigate?: () => void;
  isAdmin?: boolean;
}) {
  const t = useTranslations("Nav");
  const items = isAdmin
    ? [
        ...navKeys.slice(0, 1),
        { href: "/admin" as const, key: "admin" as const, icon: Shield },
        ...navKeys.slice(1),
      ]
    : [...navKeys];

  return (
    <nav className="flex flex-1 flex-col gap-px px-2">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <NavLink
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            active={active}
            data-tour={`nav-${item.key}`}
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

function BrandHeader({
  companyName,
  showBell = true,
}: {
  companyName?: string;
  /** False in the mobile drawer — sticky header already has a bell. */
  showBell?: boolean;
}) {
  return (
    <div className="border-b border-sidebar-border px-3 py-3.5" data-tour="brand">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="min-w-0 flex-1 overflow-hidden rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
        >
          <BrandLockup markSize="md" markVariant="solid" />
          {companyName ? (
            <p className="mt-1.5 truncate pl-[1.95rem] text-[11px] leading-snug text-muted-foreground">
              {companyName}
            </p>
          ) : null}
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <LocaleSwitcher trigger="icon" align="end" side="bottom" />
          {showBell ? <NotificationBell /> : null}
        </div>
      </div>
    </div>
  );
}

export function AppSidebar({
  companyName,
  userEmail,
  isAdmin,
}: {
  companyName?: string;
  userEmail?: string | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const tc = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <>
      <div className="sticky top-0 z-40 flex h-12 items-center justify-between gap-2 border-b border-sidebar-border bg-sidebar px-3 md:hidden">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2 text-ink">
          <BrandLockup
            markSize="sm"
            markVariant="solid"
            wordmarkClassName="truncate text-[15px]"
          />
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          <LocaleSwitcher trigger="icon" align="end" side="bottom" />
          <NotificationBell />
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-[3px] border border-transparent text-muted-foreground hover:border-sidebar-border hover:bg-raised hover:text-ink"
            aria-expanded={open}
            aria-label={open ? tc("closeMenu") : tc("openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
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
              <BrandHeader companyName={companyName} showBell={false} />
              <NavLinks
                pathname={pathname}
                onNavigate={() => setOpen(false)}
                isAdmin={isAdmin}
              />
              <div className="mt-auto">
                <SidebarAccount email={userEmail} />
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <aside className="sticky top-0 hidden h-svh w-[var(--sidebar-width)] shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <BrandHeader companyName={companyName} />
        <NavLinks pathname={pathname} isAdmin={isAdmin} />
        <div className="mt-auto">
          <SidebarAccount email={userEmail} />
        </div>
      </aside>
    </>
  );
}
