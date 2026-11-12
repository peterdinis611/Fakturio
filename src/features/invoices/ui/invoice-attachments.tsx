"use client";

import { useRef, useTransition } from "react";
import { Download, Paperclip, Trash2, Upload } from "lucide-react";
import { toast } from "@/shared/toast";
import {
  deleteInvoiceAttachmentAction,
  uploadInvoiceAttachmentAction,
} from "@/features/invoices/api/attachments";
import type { InvoiceAttachment } from "@/shared/api/types";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { formatDate } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import type { AppLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,image/gif";

type Props = {
  invoiceId: string;
  attachments: InvoiceAttachment[];
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function InvoiceAttachments({ invoiceId, attachments }: Props) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function onPickFile() {
    inputRef.current?.click();
  }

  function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file, file.name);

    startTransition(async () => {
      try {
        await uploadInvoiceAttachmentAction(invoiceId, formData);
        toast.success("Príloha bola nahratá");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Nahratie zlyhalo");
      }
    });

    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(id: string) {
    if (!window.confirm("Zmazať túto prílohu?")) return;
    startTransition(async () => {
      const result = await deleteInvoiceAttachmentAction({ id, invoiceId });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Zmazanie zlyhalo");
        return;
      }
      toast.success("Príloha zmazaná");
      router.refresh();
    });
  }

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-5 py-3">
        <div className="flex items-center gap-2">
          <Paperclip aria-hidden className="size-4 text-muted-foreground" />
          <h2 className="text-[14px] font-medium text-ink">Prílohy</h2>
          <span className="data-num text-[12px] text-faint">{attachments.length}</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={onPickFile}
        >
          <Upload className="size-3.5" aria-hidden />
          Nahrať
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => onFileChange(e.target.files)}
        />
      </div>
      {attachments.length === 0 ? (
        <p className="px-5 py-4 text-[13px] text-muted-foreground">
          Účty, skeny alebo PDF k prijatým nákladom.
        </p>
      ) : (
        <ul className="divide-y divide-rule">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-ink">{a.fileName}</p>
                <p className="data-num text-[12px] text-muted-foreground">
                  {formatBytes(a.sizeBytes)} · {formatDate(a.createdAt, locale)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" size="sm" variant="ghost" asChild>
                  <a href={`/api/attachments/${a.id}/download`} download>
                    <Download className="size-3.5" aria-hidden />
                    Stiahnuť
                  </a>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-negative hover:text-negative"
                  disabled={pending}
                  onClick={() => remove(a.id)}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Zmazať
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
