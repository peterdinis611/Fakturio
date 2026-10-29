"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "@/shared/toast";
import { skipOnboardingAction } from "@/features/company/api/company";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

export function SkipOnboardingButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSkip() {
    startTransition(async () => {
      await skipOnboardingAction();
      toast.message("Onboarding preskočený", {
        description: "Firmu doplníš neskôr v Nastaveniach → Firma.",
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
          <Spinner size="sm" label="Preskakujem" />
          Preskakujem…
        </span>
      ) : (
        "Preskočiť a nastaviť neskôr"
      )}
    </Button>
  );
}
