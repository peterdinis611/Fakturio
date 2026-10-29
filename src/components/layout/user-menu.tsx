"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function UserMenu({ email }: { email?: string | null }) {
  const t = useTranslations("Common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function logout() {
    startTransition(async () => {
      await logoutAction();
      router.replace("/sign-in");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] text-muted-foreground">
          {email ?? t("account")}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={logout}
        aria-label={t("signOut")}
        className="shrink-0 px-2"
      >
        <LogOut className="size-3.5" aria-hidden />
      </Button>
    </div>
  );
}
