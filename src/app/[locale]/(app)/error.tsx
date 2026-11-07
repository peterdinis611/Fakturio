"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { logger } from "@/shared/lib/logger";
import { ErrorScreen } from "@/shared/ui/error-screen";
import { Button } from "@/shared/ui/button";

function isUnreachable(error: Error) {
  const msg = error.message.toLowerCase();
  return (
    error.name === "ApiError" &&
    (msg.includes("nedostupn") ||
      msg.includes("unavailable") ||
      msg.includes("unreachable") ||
      msg.includes("skontroluj pripojenie"))
  );
}

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors");
  const offline = isUnreachable(error);

  useEffect(() => {
    logger.clientError("app-error", error, { offline });
  }, [error, offline]);

  return (
    <ErrorScreen
      code={offline ? "offline" : "500"}
      title={offline ? t("offlineTitle") : t("errorTitle")}
      description={offline ? t("offlineBody") : t("errorBody")}
      secondary={
        <Button type="button" variant="outline" onClick={reset}>
          {t("tryAgain")}
        </Button>
      }
    />
  );
}
