"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { auditActionLabel, formatDateTime } from "@/shared/lib/format";
import type { AuditLogEntry } from "@/shared/api/types";
import type { AppLocale } from "@/i18n/routing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

function entityHref(entry: AuditLogEntry): string | null {
  if (!entry.entityId) return null;
  switch (entry.entityType) {
    case "Invoice":
      return `/invoices/${entry.entityId}`;
    case "Customer":
      return `/customers/${entry.entityId}`;
    case "Recurring":
      return `/recurring`;
    case "Company":
      return `/settings/company`;
    default:
      return null;
  }
}

function prettyDetails(raw: string | null): string | null {
  if (!raw) return null;
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

type Props = {
  entry: AuditLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LogsDetailDialog({ entry, open, onOpenChange }: Props) {
  const t = useTranslations("Logs");
  const tc = useTranslations("Common");
  const locale = useLocale() as AppLocale;

  if (!entry) return null;

  const href = entityHref(entry);
  const details = prettyDetails(entry.detailsJson);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{auditActionLabel(entry.action, locale)}</DialogTitle>
          <DialogDescription>{entry.summary}</DialogDescription>
        </DialogHeader>

        <dl className="grid gap-3 text-[13px]">
          <div className="grid gap-0.5">
            <dt className="text-muted-foreground">{t("detailWhen")}</dt>
            <dd className="data-num text-ink">
              {formatDateTime(entry.occurredAt, locale)}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-muted-foreground">{t("detailActor")}</dt>
            <dd className="text-ink">
              {entry.actorDisplayName ?? tc("system")}
              {entry.actorEmail ? (
                <span className="mt-0.5 block text-[12px] text-muted-foreground">
                  {entry.actorEmail}
                </span>
              ) : null}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-muted-foreground">{t("detailEntity")}</dt>
            <dd className="text-ink">
              <span className="uppercase tracking-wide">{entry.entityType}</span>
              {entry.entityNumber ? (
                <span className="data-num"> · {entry.entityNumber}</span>
              ) : null}
              {href ? (
                <Link
                  href={href}
                  className="mt-1 block text-[12px] text-ink underline-offset-2 hover:underline"
                >
                  {t("openEntity")}
                </Link>
              ) : null}
            </dd>
          </div>
          {details ? (
            <div className="grid gap-0.5">
              <dt className="text-muted-foreground">{t("detailPayload")}</dt>
              <dd>
                <pre className="max-h-56 overflow-auto rounded-[4px] border border-border bg-raised/40 p-2.5 font-mono text-[11px] leading-relaxed text-ink">
                  {details}
                </pre>
              </dd>
            </div>
          ) : null}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
