import Link from "next/link";
import type { InvoiceListItem } from "@/shared/api/types";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatDate, formatMoney } from "@/shared/lib/format";

export function RecentInvoices({ items }: { items: InvoiceListItem[] }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[15px] font-medium text-ink">Posledné faktúry</h2>
        <Link
          href="/invoices"
          className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
        >
          Všetky
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="border-t border-rule py-5">
          <p className="text-[14px] text-ink">Zatiaľ žiadne faktúry</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Po vystavení sa tu zobrazia posledné doklady.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-rule border-t border-rule">
          {items.map((inv) => (
            <li
              key={inv.id}
              className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto_6.5rem_auto]"
            >
              <Link
                href={`/invoices/${inv.id}`}
                className="data-num text-[14px] font-medium hover:underline"
              >
                {inv.number}
              </Link>
              <span className="truncate text-[14px] text-ink">
                {inv.customerName}
              </span>
              <span className="hidden sm:inline">
                <StatusBadge status={inv.status} />
              </span>
              <span className="hidden text-right text-[12px] text-muted-foreground sm:block">
                {formatDate(inv.dueDate)}
              </span>
              <span className="money text-right text-[14px]">
                {formatMoney(inv.total, inv.currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
