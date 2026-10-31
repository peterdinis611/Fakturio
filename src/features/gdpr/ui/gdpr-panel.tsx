"use client";

import { useState, useTransition } from "react";
import { Download, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "@/shared/toast";
import { deleteAccountAction } from "@/features/gdpr/api/gdpr";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useRouter } from "@/i18n/navigation";

export function GdprPanel() {
  const t = useTranslations("Profile");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  function exportData() {
    window.location.href = "/api/gdpr/export";
  }

  function deleteAccount() {
    startTransition(async () => {
      const result = await deleteAccountAction({ password, confirmation });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("gdprDeleteFailed"));
        return;
      }
      toast.success(t("gdprDeleted"));
      router.push("/sign-in");
      router.refresh();
    });
  }

  return (
    <div id="gdpr" className="space-y-5 scroll-mt-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[13px] text-ink">{t("gdprExportTitle")}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {t("gdprExportHint")}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={exportData}>
          <Download className="size-3.5" aria-hidden />
          {t("gdprExport")}
        </Button>
      </div>

      <div className="border-t border-rule pt-5">
        <p className="text-[13px] text-ink">{t("gdprDeleteTitle")}</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {t("gdprDeleteHint")}
        </p>

        {!confirmOpen ? (
          <Button
            type="button"
            variant="outline"
            className="mt-3 border-destructive/40 text-destructive hover:bg-destructive/5"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-3.5" aria-hidden />
            {t("gdprDeleteStart")}
          </Button>
        ) : (
          <div className="mt-3 space-y-3 rounded-[4px] border border-destructive/25 bg-destructive/[0.03] p-3">
            <div className="space-y-1.5">
              <Label htmlFor="gdpr-password">{t("currentPassword")}</Label>
              <Input
                id="gdpr-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gdpr-confirm">{t("gdprConfirmLabel")}</Label>
              <Input
                id="gdpr-confirm"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="ZMAZAT"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="destructive"
                disabled={pending || !password || !confirmation}
                onClick={deleteAccount}
              >
                {pending ? t("gdprDeleting") : t("gdprDeleteConfirm")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  setConfirmOpen(false);
                  setPassword("");
                  setConfirmation("");
                }}
              >
                {t("gdprCancel")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
