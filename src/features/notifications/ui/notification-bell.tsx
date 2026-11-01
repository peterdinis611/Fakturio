"use client";

import { Bell } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  listNotifications,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/api/notifications";
import { startSignalHub, stopSignalHub } from "@/features/notifications/lib/signal-hub";
import type { AppNotification } from "@/features/notifications/model/types";
import { Link, useRouter } from "@/i18n/navigation";
import { formatDateTime } from "@/shared/lib/format";
import type { AppLocale } from "@/i18n/routing";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

export function NotificationBell() {
  const t = useTranslations("Notifications");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await listNotifications(20);
        setItems(data.items);
        setUnread(data.unreadCount);
      } catch {
        // offline / unauthorized — keep last state
      }
    });
  }, []);

  useEffect(() => {
    refresh();
    let cancelled = false;

    (async () => {
      try {
        const hub = await startSignalHub();
        if (cancelled) return;

        hub.on("notification", (n: AppNotification) => {
          setItems((prev) => [n, ...prev].slice(0, 20));
          setUnread((c) => c + 1);
        });
        hub.on("unreadCount", (count: number) => {
          setUnread(count);
        });
      } catch {
        // SignalR optional — inbox still works via REST
      }
    })();

    return () => {
      cancelled = true;
      void stopSignalHub();
    };
  }, [refresh]);

  function openItem(n: AppNotification) {
    startTransition(async () => {
      if (!n.isRead) {
        await markNotificationReadAction({ id: n.id });
        setItems((prev) =>
          prev.map((x) =>
            x.id === n.id ? { ...x, isRead: true, readAt: new Date().toISOString() } : x,
          ),
        );
        setUnread((c) => Math.max(0, c - 1));
      }
      if (n.href) {
        router.push(n.href);
      }
    });
  }

  function markAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction({});
      setItems((prev) =>
        prev.map((x) => ({ ...x, isRead: true, readAt: new Date().toISOString() })),
      );
      setUnread(0);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label={t("bellAria", { count: unread })}
        >
          <Bell className="size-4" aria-hidden />
          {unread > 0 ? (
            <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-[3px] bg-negative text-[9px] font-semibold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,22rem)] p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <DropdownMenuLabel className="p-0">{t("title")}</DropdownMenuLabel>
          {unread > 0 ? (
            <button
              type="button"
              className="text-[12px] text-muted-foreground hover:text-ink"
              disabled={pending}
              onClick={markAll}
            >
              {t("markAllRead")}
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator className="m-0" />
        {items.length === 0 ? (
          <p className="px-3 py-6 text-[13px] text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1">
            {items.map((n) => (
              <li key={n.id}>
                <DropdownMenuItem
                  className={cn(
                    "flex cursor-pointer flex-col items-start gap-0.5 rounded-none px-3 py-2.5",
                    !n.isRead && "bg-raised/50",
                  )}
                  onSelect={(e) => {
                    e.preventDefault();
                    openItem(n);
                  }}
                >
                  <span className="text-[13px] font-medium text-ink">{n.title}</span>
                  <span className="line-clamp-2 text-[12px] text-muted-foreground">
                    {n.body}
                  </span>
                  <span className="data-num text-[11px] text-faint">
                    {formatDateTime(n.createdAt, locale)}
                  </span>
                </DropdownMenuItem>
              </li>
            ))}
          </ul>
        )}
        <DropdownMenuSeparator className="m-0" />
        <div className="px-2 py-1.5">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link href="/settings/notifications">{t("settings")}</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
