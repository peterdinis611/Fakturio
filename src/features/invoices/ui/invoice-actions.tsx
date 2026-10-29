"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/shared/toast";
import {
  cancelInvoiceAction,
  createCreditNoteAction,
  deleteInvoiceAction,
  duplicateInvoiceAction,
  finalizeProformaAction,
  issueInvoiceAction,
  markPaidAction,
} from "@/features/invoices/api/invoices";
import type { Invoice } from "@/shared/api/types";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { cancelSchema } from "@/entities/invoice/model/schema";
import { XmlPreview } from "@/widgets/preview/xml-preview";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Spinner } from "@/shared/ui/spinner";
import { buildInvoiceXml } from "@/shared/lib/preview/invoice-xml";

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
  const xml = buildInvoiceXml(invoice);
  const docType = invoice.documentType ?? "Invoice";

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
    run(() => issueInvoiceAction({ id: invoice.id }), "Doklad bol vystavený");
  }

  function handleMarkPaid() {
    run(
      () => markPaidAction({ id: invoice.id }),
      "Doklad bol označený ako zaplatený",
    );
  }

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateInvoiceAction({ id: invoice.id });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Duplikácia zlyhala");
        return;
      }
      toast.success("Doklad bol duplikovaný");
      router.push(`/invoices/${result.data.id}`);
    });
  }

  function handleCreditNote() {
    if (
      !window.confirm(
        `Vytvoriť dobropis k faktúre ${invoice.number}? Skopírujú sa položky a vystaví sa nový doklad (DOB…).`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await createCreditNoteAction({ id: invoice.id });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Dobropis zlyhal");
        return;
      }
      toast.success("Dobropis bol vytvorený");
      router.push(`/invoices/${result.data.id}`);
    });
  }

  function handleFinalizeProforma() {
    if (
      !window.confirm(
        `Vystaviť daňový doklad zo zálohovej ${invoice.number}?`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await finalizeProformaAction({ id: invoice.id });
      if (!result?.data) {
        toast.error(
          actionErrorMessage(result ?? {}) ?? "Vystavenie faktúry zlyhalo",
        );
        return;
      }
      toast.success("Faktúra bola vystavená zo zálohovej");
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
      toast.success("Doklad bol zrušený");
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
  const canCreditNote =
    docType === "Invoice" &&
    (invoice.status === "Issued" ||
      invoice.status === "Paid" ||
      invoice.status === "Overdue");
  const canFinalizeProforma =
    docType === "Proforma" &&
    (invoice.status === "Issued" ||
      invoice.status === "Paid" ||
      invoice.status === "Overdue");
  const canDuplicate = docType !== "CreditNote";
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

      {canCreditNote ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={handleCreditNote}
        >
          Dobropis
        </Button>
      ) : null}

      {canFinalizeProforma ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={handleFinalizeProforma}
        >
          Daňový doklad
        </Button>
      ) : null}

      {canCancel ? (
        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogTrigger asChild>
            <Button type="button" size="sm" variant="outline" disabled={pending}>
              Zrušiť
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Zrušiť doklad</DialogTitle>
              <DialogDescription>
                Uveď dôvod zrušenia dokladu {invoice.number}.
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

      {canDuplicate ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={handleDuplicate}
        >
          Duplikovať
        </Button>
      ) : null}

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
              Náhľad PDF · QR
            </Link>
          </Button>
          <Button type="button" size="sm" variant="ghost" asChild>
            <a href={pdfDownload} download>
              Stiahnuť PDF
            </a>
          </Button>
          <XmlPreview
            title={`XML · ${invoice.number}`}
            description="Štruktúrovaný náhľad dokladu (Fakturio XML). Nie je oficiálny e-fakturačný formát."
            xml={xml}
            fileName={`${invoice.number}.xml`}
          />
        </>
      ) : null}
      {pending ? (
        <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Spinner size="sm" label="Prebieha" />
          Prebieha…
        </span>
      ) : null}
    </div>
  );
}
