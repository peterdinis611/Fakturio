import type { InvoiceStatus } from "@/lib/api/types";
import { statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const styles: Record<InvoiceStatus, string> = {
  Draft: "bg-pill-neutral-bg text-pill-neutral-ink",
  Issued: "bg-pill-neutral-bg text-ink",
  Paid: "bg-pill-positive-bg text-pill-positive-ink",
  Cancelled: "bg-transparent text-muted-foreground line-through",
  Overdue: "bg-pill-negative-bg text-pill-negative-ink",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] px-1.5 py-0.5 text-[12px] font-medium",
        styles[status],
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
