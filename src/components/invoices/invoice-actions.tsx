"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  cancelInvoiceAction,
  deleteInvoiceAction,
  duplicateInvoiceAction,
  issueInvoiceAction,
  markPaidAction,
} from "@/actions/invoices";
import type { Invoice } from "@/lib/api/types";
import { actionErrorMessage } from "@/lib/action-utils";
import { cancelSchema } from "@/lib/validations/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type InvoiceActionsProps = {
  invoice: Invoice;
};

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);

  const pdfInline = `/api/pdf/${invoice.id}?disposition=inline`;
  const pdfDownload = `/api/pdf/${invoice.id}?disposition=attachment`;

  function run(
    action: () => Promise<{ data?: unknown; serverError?: string; validationErrors?: unknown }>,
    success: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Operácia zlyhala");
        return;
      }
      toast.success(success);
      router.refresh();
    });
  }

  function handleIssue() {
    run(() => issueInvoiceAction({ id: invoice.id }), "Faktúra bola vystavená");
  }

  function handleMarkPaid() {
    run(
      () => markPaidAction({ id: invoice.id }),
      "Faktúra bola označená ako zaplatená",
    );
  }

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateInvoiceAction({ id: invoice.id });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Duplikácia zlyhala");
        return;
      }
      toast.success("Faktúra bola duplikovaná");
      router.push(`/invoices/${result.data.id}`);
    });
  }

  function handleDelete() {
    if (!window.confirm("Naozaj zmazať tento koncept?")) return;
    startTransition(async () => {
      const result = await deleteInvoiceAction({ id: invoice.id });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Zmazanie zlyhalo");
        return;
      }
      toast.success("Koncept bol zmazaný");
      router.push("/invoices");
    });
  }

  function handleCancel() {
    const parsed = cancelSchema.safeParse({ reason: cancelReason });
    if (!parsed.success) {
      setCancelError(parsed.error.issues[0]?.message ?? "Neplatný dôvod");
      return;
    }
    setCancelError(null);

    startTransition(async () => {
      const result = await cancelInvoiceAction({
        id: invoice.id,
        reason: parsed.data.reason,
      });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Zrušenie zlyhalo");
        return;
      }
      toast.success("Faktúra bola zrušená");
      setCancelOpen(false);
      setCancelReason("");
      router.refresh();
    });
  }

  const canIssue = invoice.status === "Draft";
  const canMarkPaid =
    invoice.status === "Issued" || invoice.status === "Overdue";
  const canCancel =
    invoice.status === "Draft" ||
    invoice.status === "Issued" ||
    invoice.status === "Overdue";
  const canDelete = invoice.status === "Draft";
  const showPdf =
    invoice.status !== "Draft" && invoice.status !== "Cancelled";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canIssue ? (
        <Button type="button" size="sm" disabled={pending} onClick={handleIssue}>
          Vystaviť
        </Button>
      ) : null}

      {canMarkPaid ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={handleMarkPaid}
        >
          Označiť ako zaplatenú
        </Button>
      ) : null}

      {canCancel ? (
        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogTrigger asChild>
            <Button type="button" size="sm" variant="outline" disabled={pending}>
              Zrušiť
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Zrušiť faktúru</DialogTitle>
              <DialogDescription>
                Uveď dôvod zrušenia faktúry {invoice.number}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cancel-reason">Dôvod</Label>
              <Input
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (cancelError) setCancelError(null);
                }}
                placeholder="Napr. chybné údaje"
                aria-invalid={!!cancelError}
              />
              {cancelError ? (
                <p className="text-xs text-destructive">{cancelError}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                onClick={handleCancel}
              >
                Potvrdiť zrušenie
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={handleDuplicate}
      >
        Duplikovať
      </Button>

      {canDelete ? (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={handleDelete}
        >
          Zmazať
        </Button>
      ) : null}

      {showPdf ? (
        <>
          <Button type="button" size="sm" variant="ghost" asChild>
            <Link href={pdfInline} target="_blank" rel="noopener noreferrer">
              Náhľad PDF
            </Link>
          </Button>
          <Button type="button" size="sm" variant="ghost" asChild>
            <a href={pdfDownload} download>
              Stiahnuť PDF
            </a>
          </Button>
        </>
      ) : null}
    </div>
  );
}
