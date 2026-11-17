"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/shared/toast";
import { sendTestEmailAction } from "@/features/emails/api/emails";
import type { EmailStatus } from "@/features/emails/model/types";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Spinner } from "@/shared/ui/spinner";

export function EmailStatusPanel({ status }: { status: EmailStatus }) {
  const t = useTranslations("Notifications");
  const [to, setTo] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3 rounded-[4px] border border-rule bg-canvas/40 px-4 py-3">
      <div>
        <p className="text-[13px] font-medium text-ink">{t("emailDelivery")}</p>
        <p className="text-[12px] text-muted-foreground">
          {status.configured
            ? t("emailConfigured", {
                provider: status.provider,
                from: status.fromAddress ?? "—",
              })
            : t("emailNotConfigured")}
        </p>
      </div>
      {status.configured ? (
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid min-w-[12rem] flex-1 gap-1.5">
            <Label htmlFor="test-email-to">{t("emailTestTo")}</Label>
            <Input
              id="test-email-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder={t("emailTestToPlaceholder")}
              disabled={pending}
              className="h-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await sendTestEmailAction({ to: to.trim() });
                if (!result?.data) {
                  toast.error(
                    actionErrorMessage(result ?? {}) ?? t("emailTestFailed"),
                  );
                  return;
                }
                toast.success(t("emailTestSent", { to: result.data.to }));
              });
            }}
          >
            {pending ? <Spinner className="size-4" /> : null}
            {t("emailSendTest")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
