"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ProfileSignOut() {
  const t = useTranslations("Common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSignOut() {
    startTransition(async () => {
      await logoutAction();
      toast.message("Odhlásený");
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
