"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  markReminderSentAction,
  syncOverdueAction,
} from "@/actions/invoices";
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
          const result = await markReminderSentAction(invoiceId);
          if (!result.ok) {
            toast.error(result.message);
            return;
          }
          toast.success("Upomienka označená ako odoslaná");
          router.refresh();
        });
      }}
    >
      Odoslané
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
          if (!result.ok) {
            toast.error(result.message);
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
      Sync overdue
    </Button>
  );
}
