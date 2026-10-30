"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/shared/toast";
import { skipOnboardingAction } from "@/features/company/api/company";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

export function SkipOnboardingButton() {
  const t = useTranslations("Onboarding");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSkip() {
    startTransition(async () => {
      await skipOnboardingAction();
      toast.message(t("skipped"), {
        description: t("skipToast"),
      });
      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={onSkip}
      className="text-muted-foreground"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Spinner size="sm" label={t("skip")} />
          {t("skip")}…
        </span>
      ) : (
        t("skip")
      )}
    </Button>
  );
}
