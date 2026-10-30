"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/features/auth/api/auth";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

export function ProfileSignOut() {
  const t = useTranslations("Common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSignOut() {
    startTransition(async () => {
      await logoutAction();
      toast.message(t("signedOut"));
      router.replace("/sign-in");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={onSignOut}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Spinner size="sm" label={t("signOut")} />
          {t("signOut")}…
        </span>
      ) : (
        <>
          <LogOut className="size-3.5" aria-hidden />
          {t("signOut")}
        </>
      )}
    </Button>
  );
}
