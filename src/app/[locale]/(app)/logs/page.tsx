import Link from "next/link";
import { ScrollText } from "lucide-react";
import { listAuditLogs } from "@/features/logs/api/logs";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { DebouncedSearchField } from "@/shared/ui/debounced-search-field";
import { EmptyState } from "@/shared/ui/empty-state";
import type { AuditAction } from "@/shared/api/types";
import { auditActionLabel, formatDateTime } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export const metadata = { title: "Logy" };

const ACTIONS: (AuditAction | "all")[] = [
  "all",
  "Issued",
  "Paid",
  "Cancelled",
  "ReminderSent",
  "Created",
  "CreditNoteCreated",
  "ProformaFinalized",
  "OverdueMarked",
];

const actionTone: Partial<Record<AuditAction, string>> = {
  Paid: "text-positive",
  Cancelled: "text-negative",
  OverdueMarked: "text-negative",
  ReminderSent: "text-ink",
  Issued: "text-ink",
  CreditNoteCreated: "text-ink",
};

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string;
    q?: string;
    page?: string;
    entityId?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const action =
    sp.action && sp.action !== "all" ? (sp.action as AuditAction) : undefined;
  const search = sp.q?.trim() || undefined;
  const entityId = sp.entityId?.trim() || undefined;

  const data = await listAuditLogs({
    page,
    pageSize: 40,
    action,
    search,
    entityId,
  });

  return (
    <div>
      <PageHeader
        title="Logy"
        description="Kto a kedy vystavil, zaplatil, zrušil doklad alebo poslal upomienku."
        ledger={
          <>
            <span>{data.totalCount} záznamov</span>
            <span>Audit trail</span>
          </>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-border pb-0">
        {ACTIONS.map((a) => {
          const href =
            a === "all"
              ? `/logs${search ? `?q=${encodeURIComponent(search)}` : ""}`
              : `/logs?action=${a}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
          const active = (a === "all" && !action) || action === a;
          return (
            <Link
              key={a}
              href={href}
              className={cn(
                "px-2.5 py-2 text-[13px] transition-colors",
                active
                  ? "border-b-2 border-ink font-medium text-ink"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              {a === "all" ? "Všetky" : auditActionLabel(a)}
            </Link>
          );
        })}
      </div>

      <DebouncedSearchField
        path="/logs"
        placeholder="Hľadať číslo, súhrn, aktéra…"
        initialQuery={search ?? ""}
        extraParams={{
          ...(action ? { action } : {}),
          ...(entityId ? { entityId } : {}),
        }}
      />

      {data.items.length === 0 ? (
        <EmptyState
          icon={<ScrollText />}
          title="Zatiaľ žiadne logy"
          description="Události sa zapíšu pri vystavení, úhrade, zrušení alebo upomienke."
        />
      ) : (
        <ol className="divide-y divide-border border border-border bg-panel">
          {data.items.map((entry) => (
            <li
              key={entry.id}
              className="grid gap-2 px-4 py-3 sm:grid-cols-[7.5rem_6.5rem_1fr_auto] sm:items-baseline sm:gap-4"
            >
              <time
                dateTime={entry.occurredAt}
                className="data-num text-[12px] text-muted-foreground"
              >
                {formatDateTime(entry.occurredAt)}
              </time>
              <span
                className={cn(
                  "text-[12px] font-medium uppercase tracking-wide",
                  actionTone[entry.action] ?? "text-muted-foreground",
                )}
              >
                {auditActionLabel(entry.action)}
              </span>
              <div className="min-w-0">
                <p className="text-[14px] text-ink">{entry.summary}</p>
                {entry.entityNumber && entry.entityId ? (
                  <Link
                    href={`/invoices/${entry.entityId}`}
                    className="data-num mt-0.5 inline-block text-[12px] text-muted-foreground hover:text-ink hover:underline"
                  >
                    {entry.entityNumber}
                  </Link>
                ) : null}
              </div>
              <p className="text-[12px] text-muted-foreground sm:text-right">
                {entry.actorDisplayName ?? "Systém"}
              </p>
            </li>
          ))}
        </ol>
      )}

      {data.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-[13px] text-muted-foreground">
          <span>
            Strana {data.page} / {data.totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/logs?page=${page - 1}${action ? `&action=${action}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                className="hover:text-ink"
              >
                Predchádzajúca
              </Link>
            ) : null}
            {page < data.totalPages ? (
              <Link
                href={`/logs?page=${page + 1}${action ? `&action=${action}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                className="hover:text-ink"
              >
                Ďalšia
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
