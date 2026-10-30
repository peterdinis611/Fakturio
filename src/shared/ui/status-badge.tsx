"use client";

import { useLocale } from "next-intl";
import type { InvoiceStatus } from "@/shared/api/types";
import { statusLabelFor } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { AppLocale } from "@/i18n/routing";

const styles: Record<InvoiceStatus, string> = {
  Draft: "text-muted-foreground",
  Issued: "text-ink",
  Paid: "text-positive",
  Cancelled: "text-muted-foreground line-through",
  Overdue: "text-negative",
};

const dots: Record<InvoiceStatus, string> = {
  Draft: "bg-faint",
  Issued: "bg-ink",
  Paid: "bg-positive",
  Cancelled: "bg-faint",
  Overdue: "bg-negative",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const locale = useLocale() as AppLocale;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px] font-medium",
        styles[status],
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-none", dots[status])}
      />
      {statusLabelFor(status, locale)}
    </span>
  );
}
