"use client";

import { Bell, BellOff, Settings2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/api/notifications";
import {
  acquireSignalHub,
  releaseSignalHub,
} from "@/features/notifications/lib/signal-hub";
import type {
  AppNotification,
  NotificationList,
} from "@/features/notifications/model/types";
import { Link, useRouter } from "@/i18n/navigation";
import { formatDateTime } from "@/shared/lib/format";
import type { AppLocale } from "@/i18n/routing";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

async function fetchInbox(take = 20): Promise<NotificationList> {
  const res = await fetch(`/api/notifications/inbox?take=${take}`, {
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error(`inbox_${res.status}`);
  return (await res.json()) as NotificationList;
}

export function NotificationBell({
  className,
  align = "end",
}: {
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const t = useTranslations("Notifications");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const loadedOnce = useRef(false);

  const refresh = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await fetchInbox(20);
        setItems(data.items);
        setUnread(data.unreadCount);
      } catch {
        // offline / unauthorized — keep last state
      }
    });
  }, []);

  useEffect(() => {
    if (!loadedOnce.current) {
      loadedOnce.current = true;
      refresh();
    }

    let cancelled = false;
    let hub: Awaited<ReturnType<typeof acquireSignalHub>> = null;

    const onNotification = (n: AppNotification) => {
      setItems((prev) => [n, ...prev].slice(0, 20));
      setUnread((c) => c + 1);
    };
    const onUnread = (count: number) => {
      setUnread(count);
    };

    void (async () => {
      hub = await acquireSignalHub();
      if (cancelled || !hub) return;
      hub.on("notification", onNotification);
      hub.on("unreadCount", onUnread);
    })();

    return () => {
      cancelled = true;
      hub?.off("notification", onNotification);
      hub?.off("unreadCount", onUnread);
      releaseSignalHub();
    };
  }, [refresh]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) refresh();
  }

  function openItem(n: AppNotification) {
    startTransition(async () => {
      if (!n.isRead) {
        await markNotificationReadAction({ id: n.id });
        setItems((prev) =>
          prev.map((x) =>
            x.id === n.id
              ? { ...x, isRead: true, readAt: new Date().toISOString() }
              : x,
          ),
        );
        setUnread((c) => Math.max(0, c - 1));
      }
      setOpen(false);
      if (n.href) {
        router.push(n.href);
      }
    });
  }

  function markAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction({});
      setItems((prev) =>
        prev.map((x) => ({
          ...x,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
      );
      setUnread(0);
    });
  }

  const hasUnread = unread > 0;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-tour="notifications"
          className={cn(
            "notification-bell relative inline-flex size-9 shrink-0 items-center justify-center",
            "rounded-[3px] border border-sidebar-border bg-raised/40 text-muted-foreground",
            "transition-[color,background-color,border-color,transform] duration-150",
            "hover:border-control hover:bg-raised hover:text-ink",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25",
            "data-popup-open:border-ink data-popup-open:bg-active data-popup-open:text-ink",
            hasUnread && "border-signal/35 text-ink",
            className,
          )}
          aria-label={t("bellAria", { count: unread })}
        >
          <Bell className="size-4" strokeWidth={1.6} aria-hidden />
          {hasUnread ? (
            <span
              className={cn(
                "absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center",
                "rounded-[3px] border border-sidebar bg-signal px-1",
                "text-[9px] font-bold leading-none tracking-tight text-ground",
              )}
              aria-hidden
            >
              {unread > 9 ? "9+" : unread}
            </span>
          ) : (
            <span
              className="absolute top-1.5 right-1.5 size-1.5 rounded-[1px] bg-faint/50"
              aria-hidden
            />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side="bottom"
        sideOffset={8}
        collisionPadding={12}
        className={cn(
          "notification-tray z-[80] w-[min(100vw-1.5rem,22.5rem)] min-w-[18rem] overflow-hidden p-0",
          "rounded-[4px] border border-border bg-popover text-popover-foreground",
          "shadow-[0_16px_48px_-12px_rgba(0,0,0,0.55)] ring-1 ring-foreground/10",
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-rule px-3.5 py-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold tracking-tight text-ink">
              {t("title")}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {hasUnread
                ? t("unreadCount", { count: unread })
                : t("allCaughtUp")}
            </p>
          </div>
          {hasUnread ? (
            <button
              type="button"
              className={cn(
                "shrink-0 rounded-[3px] px-2 py-1 text-[11px] font-medium",
                "text-signal hover:bg-signal/10 disabled:opacity-50",
              )}
              disabled={pending}
              onClick={markAll}
            >
              {t("markAllRead")}
            </button>
          ) : null}
        </header>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <span
              className="grid size-10 place-items-center rounded-[4px] border border-dashed border-border text-faint"
              aria-hidden
            >
              <BellOff className="size-4" strokeWidth={1.5} />
            </span>
            <p className="text-[13px] font-medium text-ink">{t("empty")}</p>
            <p className="max-w-[16rem] text-[12px] text-muted-foreground">
              {t("emptyHint")}
            </p>
          </div>
        ) : (
          <ul className="max-h-[min(22rem,55vh)] overflow-y-auto overscroll-contain py-1">
            {items.map((n) => (
              <li key={n.id}>
                <DropdownMenuItem
                  className={cn(
                    "group relative flex cursor-pointer flex-col items-stretch gap-1 rounded-none px-3.5 py-2.5",
                    "border-l-2 border-l-transparent outline-none",
                    "focus:bg-raised/70 data-[highlighted]:bg-raised/70",
                    !n.isRead && "border-l-signal bg-signal/[0.04]",
                  )}
                  onSelect={(e) => {
                    e.preventDefault();
                    openItem(n);
                  }}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead ? (
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-[1px] bg-signal"
                        aria-hidden
                      />
                    ) : (
                      <span className="mt-1.5 size-1.5 shrink-0" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-[13px] leading-snug text-ink",
                          !n.isRead ? "font-semibold" : "font-medium",
                        )}
                      >
                        {n.title}
                      </span>
                      <span className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
                        {n.body}
                      </span>
                      <span className="data-num mt-1.5 block text-[10px] tracking-wide text-faint uppercase">
                        {formatDateTime(n.createdAt, locale)}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              </li>
            ))}
          </ul>
        )}

        <DropdownMenuSeparator className="m-0" />
        <div className="bg-raised/30 px-2 py-1.5">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start gap-2 text-[12px] text-muted-foreground hover:text-ink"
          >
            <Link href="/settings/notifications" onClick={() => setOpen(false)}>
              <Settings2 className="size-3.5 opacity-70" aria-hidden />
              {t("settings")}
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
