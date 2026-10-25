"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  markReminderSentAction,
  syncOverdueAction,
} from "@/actions/invoices";
import { actionErrorMessage } from "@/lib/action-utils";
import { Button } from "@/components/ui/button";

export function MarkReminderSentButton({ invoiceId }: { invoiceId: string }) {
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
          toast.success("Upomienka označená ako odoslaná");
          router.refresh();
        });
      }}
    >
      {pending ? "Ukladám…" : "Označiť odoslané"}
    </Button>
  );
}

export function SyncOverdueButton() {
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
              : "Žiadne zmeny",
          );
          router.refresh();
        });
      }}
    >
      <RefreshCw className={pending ? "animate-spin" : undefined} />
      {pending ? "Synchronizujem…" : "Obnoviť omeškané"}
    </Button>
  );
}
