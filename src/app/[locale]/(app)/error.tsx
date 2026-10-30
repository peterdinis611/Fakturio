"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorScreen } from "@/shared/ui/error-screen";
import { Button } from "@/shared/ui/button";

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code="500"
      title={t("errorTitle")}
      description={t("errorBody")}
      secondary={
        <Button type="button" variant="outline" onClick={reset}>
          {t("tryAgain")}
        </Button>
      }
    />
  );
}
