"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { toast } from "@/shared/toast";
import {
  markReminderSentAction,
  syncOverdueAction,
} from "@/features/invoices/api/invoices";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { Button } from "@/shared/ui/button";

export function MarkReminderSentButton({ invoiceId }: { invoiceId: string }) {
  const t = useTranslations("Reminders");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await markReminderSentAction({ id: invoiceId });
          if (!result?.data) {
            toast.error(actionErrorMessage(result ?? {}) ?? "Uloženie zlyhalo");
            return;
          }
          toast.success(t("markedSent"));
          router.refresh();
        });
      }}
    >
      {pending ? "Ukladám…" : t("markSent")}
    </Button>
  );
}

export function SyncOverdueButton() {
  const t = useTranslations("Reminders");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await syncOverdueAction();
          if (!result?.data) {
            toast.error(
              actionErrorMessage(result ?? {}) ?? "Synchronizácia zlyhala",
            );
            return;
          }
          toast.success(
            result.data.updatedCount > 0
              ? `Aktualizovaných ${result.data.updatedCount} faktúr`
              : t("noChanges"),
          );
          router.refresh();
        });
      }}
    >
      <RefreshCw className={pending ? "animate-spin" : undefined} />
      {pending ? "Synchronizujem…" : t("refreshOverdue")}
    </Button>
  );
}
