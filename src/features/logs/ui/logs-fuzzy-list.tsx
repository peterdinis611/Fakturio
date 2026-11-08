"use client";

import Link from "next/link";
import { ScrollText } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useFuzzySearch } from "@/shared/hooks/use-fuzzy-search";
import { fuzzyKeys } from "@/shared/lib/fuzzy-search";
import { auditActionLabel, formatDateTime } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { AuditAction, AuditLogEntry } from "@/shared/api/types";
import type { AppLocale } from "@/i18n/routing";
import { EmptyState } from "@/shared/ui/empty-state";
import { FuzzySearchField } from "@/shared/ui/fuzzy-search-field";
import { LogsDetailDialog } from "@/features/logs/ui/logs-detail-dialog";

const actionTone: Partial<Record<AuditAction, string>> = {
  Paid: "text-positive",
  Cancelled: "text-negative",
  OverdueMarked: "text-negative",
  CustomerDeleted: "text-negative",
  RecurringDeleted: "text-negative",
  GdprErasure: "text-negative",
  ReminderSent: "text-ink",
  Issued: "text-ink",
  CreditNoteCreated: "text-ink",
  LoginSucceeded: "text-muted-foreground",
  ExportRequested: "text-muted-foreground",
  PaymentImportApplied: "text-positive",
};

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

type Props = {
  items: AuditLogEntry[];
  initialQuery?: string;
  action?: AuditAction;
  entityId?: string;
  entityType?: string;
  from?: string;
  to?: string;
  truncated?: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function LogsFuzzyList({
  items,
  initialQuery = "",
  action,
  entityId,
  entityType,
  from,
  to,
  truncated = false,
  totalCount,
  page,
  pageSize,
  totalPages,
}: Props) {
  const t = useTranslations("Logs");
  const tc = useTranslations("Common");
  const locale = useLocale() as AppLocale;
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const filtered = useFuzzySearch(items, query, {
    keys: fuzzyKeys.auditLog,
    threshold: 0.36,
  });

  const extraParams = useMemo(
    () => ({
      ...(action ? { action } : {}),
      ...(entityId ? { entityId } : {}),
      ...(entityType ? { entityType } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(page > 1 ? { page: String(page) } : {}),
    }),
    [action, entityId, entityType, from, to, page],
  );

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (action) params.set("action", action);
    if (entityType) params.set("entityType", entityType);
    if (entityId) params.set("entityId", entityId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (query.trim()) params.set("q", query.trim());
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/logs?${qs}` : "/logs";
  }

  return (
    <>
      <FuzzySearchField
        path="/logs"
        value={query}
        onValueChange={setQuery}
        placeholder={t("placeholder")}
        extraParams={extraParams}
      />

      {truncated ? (
        <p className="mb-3 text-[12px] text-muted-foreground">
          {t("pageHint", {
            shown: items.length,
            total: totalCount,
            page,
            pages: totalPages,
          })}
        </p>
      ) : (
        <p className="mb-3 text-[12px] text-muted-foreground">
          {t("ledgerCount", { count: totalCount })}
        </p>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ScrollText />}
          title={query.trim() ? tc("noMatches") : t("emptyTitle")}
          description={
            query.trim() ? tc("tryAnotherQuery") : t("emptyBody")
          }
        />
      ) : (
        <ol className="divide-y divide-border border border-border bg-panel">
          {filtered.map((entry) => {
            const href = entityHref(entry);
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => setSelected(entry)}
                  className="grid w-full gap-2 px-4 py-3 text-left transition-colors hover:bg-raised/50 sm:grid-cols-[7.5rem_7.5rem_1fr_auto] sm:items-baseline sm:gap-4"
                >
                  <time
                    dateTime={entry.occurredAt}
                    className="data-num text-[12px] text-muted-foreground"
                  >
                    {formatDateTime(entry.occurredAt, locale)}
                  </time>
                  <span
                    className={cn(
                      "text-[12px] font-medium tracking-wide uppercase",
                      actionTone[entry.action] ?? "text-muted-foreground",
                    )}
                  >
                    {auditActionLabel(entry.action, locale)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] text-ink">{entry.summary}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      <span className="uppercase tracking-wide">
                        {entry.entityType}
                      </span>
                      {entry.entityNumber ? (
                        <>
                          {" · "}
                          {href ? (
                            <Link
                              href={href}
                              onClick={(e) => e.stopPropagation()}
                              className="data-num hover:text-ink hover:underline"
                            >
                              {entry.entityNumber}
                            </Link>
                          ) : (
                            <span className="data-num">{entry.entityNumber}</span>
                          )}
                        </>
                      ) : null}
                    </p>
                  </div>
                  <p className="text-[12px] text-muted-foreground sm:text-right">
                    {entry.actorDisplayName ?? tc("system")}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {totalPages > 1 ? (
        <nav
          className="mt-4 flex items-center justify-between gap-3 text-[13px]"
          aria-label={t("pagination")}
        >
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="text-ink hover:underline">
              {t("prevPage")}
            </Link>
          ) : (
            <span className="text-faint">{t("prevPage")}</span>
          )}
          <span className="text-muted-foreground">
            {t("pageOf", { page, pages: totalPages, size: pageSize })}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="text-ink hover:underline">
              {t("nextPage")}
            </Link>
          ) : (
            <span className="text-faint">{t("nextPage")}</span>
          )}
        </nav>
      ) : null}

      <LogsDetailDialog
        entry={selected}
        open={selected != null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}
