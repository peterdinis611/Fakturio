"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "@/shared/toast";
import { sendInvoiceEmailAction } from "@/features/emails/api/emails";
import type { Invoice } from "@/shared/api/types";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
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

export function SendInvoiceEmailDialog({
  invoice,
  emailConfigured,
}: {
  invoice: Invoice;
  emailConfigured: boolean;
}) {
  const t = useTranslations("InvoiceDetail");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [to, setTo] = useState(invoice.customer.email ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachPdf, setAttachPdf] = useState(true);
  const [includePublicLink, setIncludePublicLink] = useState(true);

  function handleSend() {
    startTransition(async () => {
      const result = await sendInvoiceEmailAction({
        id: invoice.id,
        to: to.trim(),
        subject: subject.trim(),
        message: message.trim(),
        attachPdf,
        includePublicLink,
      });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("emailSendFailed"));
        return;
      }
      toast.success(t("emailSent", { to: result.data.to }));
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!emailConfigured}
          title={emailConfigured ? undefined : t("emailNotConfigured")}
        >
          {t("sendEmail")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("sendEmailTitle")}</DialogTitle>
          <DialogDescription>
            {t("sendEmailBody", { number: invoice.number })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="email-to">{t("emailTo")}</Label>
            <Input
              id="email-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder={invoice.customer.email ?? "customer@example.com"}
              disabled={pending}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email-subject">{t("emailSubject")}</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("emailSubjectPlaceholder", {
                number: invoice.number,
              })}
              disabled={pending}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email-message">{t("emailMessage")}</Label>
            <Textarea
              id="email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={t("emailMessagePlaceholder")}
              disabled={pending}
            />
          </div>
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={attachPdf}
              onCheckedChange={(v) => setAttachPdf(Boolean(v))}
              disabled={pending}
            />
            <span className="text-[13px]">{t("emailAttachPdf")}</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={includePublicLink}
              onCheckedChange={(v) => setIncludePublicLink(Boolean(v))}
              disabled={pending}
            />
            <span className="text-[13px]">{t("emailIncludeLink")}</span>
          </label>
        </div>
        <DialogFooter>
          <Button type="button" disabled={pending || !to.trim()} onClick={handleSend}>
            {pending ? <Spinner className="size-4" /> : null}
            {t("emailSend")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
