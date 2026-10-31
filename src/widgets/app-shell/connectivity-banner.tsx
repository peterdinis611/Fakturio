"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { CloudOffIcon, RefreshCwIcon, WifiOffIcon } from "lucide-react";
import { useConnectivity } from "@/shared/connectivity/use-connectivity";
import { toast } from "@/shared/toast";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

/**
 * Sticky banner when the browser is offline or the API health probe fails.
 */
export function ConnectivityBanner() {
  const t = useTranslations("Offline");
  const { status, ready, checking, check, consumeRestoredFlag, isOnline } =
    useConnectivity();

  useEffect(() => {
    if (!ready || !isOnline) return;
    if (consumeRestoredFlag()) {
      toast.message(t("backOnline"));
    }
  }, [ready, isOnline, consumeRestoredFlag, t]);

  // Avoid SSR/client HTML mismatch — wait until the first client probe finishes.
  if (!ready || status === "online") return null;

  const offline = status === "offline";

  return (
    <div
      className="sticky top-0 z-40 border-b border-border px-4 py-2.5 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
    >
      <Alert
        className={cn(
          "rounded-[6px]",
          offline
            ? "border-warning/35 bg-pill-warning-bg text-pill-warning-ink"
            : "border-negative/35 bg-negative/10 text-negative",
        )}
      >
        {offline ? <WifiOffIcon /> : <CloudOffIcon />}
        <AlertTitle>
          {offline ? t("titleOffline") : t("titleServer")}
        </AlertTitle>
        <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
          <span>{offline ? t("bodyOffline") : t("bodyServer")}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={checking}
            onClick={() => {
              void check();
            }}
          >
            <RefreshCwIcon
              className={cn("size-3.5", checking && "animate-spin")}
              aria-hidden
            />
            {checking ? t("checking") : t("retry")}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
