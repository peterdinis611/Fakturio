"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { logger } from "@/shared/lib/logger";
import { ErrorScreen } from "@/shared/ui/error-screen";
import { Button } from "@/shared/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors");

  useEffect(() => {
    logger.clientError("locale-error", error);
  }, [error]);

  return (
    <ErrorScreen
      code="500"
      title={t("crashTitle")}
      description={t("crashBody")}
      secondary={
        <Button type="button" variant="outline" onClick={reset}>
          {t("tryAgain")}
        </Button>
      }
    />
  );
}
