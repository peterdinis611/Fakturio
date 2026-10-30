"use client";

import Link from "next/link";
import { ScrollText } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useFuzzySearch } from "@/shared/hooks/use-fuzzy-search";
import { fuzzyKeys } from "@/shared/lib/fuzzy-search";
import { auditActionLabel, formatDateTime } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { AuditAction, AuditLogEntry } from "@/shared/api/types";
import type { AppLocale } from "@/i18n/routing";
import { EmptyState } from "@/shared/ui/empty-state";
import { FuzzySearchField } from "@/shared/ui/fuzzy-search-field";

const actionTone: Partial<Record<AuditAction, string>> = {
  Paid: "text-positive",
  Cancelled: "text-negative",
  OverdueMarked: "text-negative",
  ReminderSent: "text-ink",
  Issued: "text-ink",
  CreditNoteCreated: "text-ink",
};

type Props = {
  items: AuditLogEntry[];
  initialQuery?: string;
  action?: AuditAction;
  entityId?: string;
  truncated?: boolean;
};

export function LogsFuzzyList({
  items,
  initialQuery = "",
  action,
  entityId,
  truncated = false,
}: Props) {
  const t = useTranslations("Logs");
  const tc = useTranslations("Common");
  const locale = useLocale() as AppLocale;
  const [query, setQuery] = useState(initialQuery);
  const filtered = useFuzzySearch(items, query, {
    keys: fuzzyKeys.auditLog,
    threshold: 0.36,
  });

  return (
    <>
      <FuzzySearchField
        path="/logs"
        value={query}
        onValueChange={setQuery}
        placeholder={t("placeholder")}
        extraParams={{
          ...(action ? { action } : {}),
          ...(entityId ? { entityId } : {}),
        }}
      />

      {truncated ? (
        <p className="mb-3 text-[12px] text-muted-foreground">
          {t("fuzzyHint", { count: items.length })}
        </p>
      ) : null}

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
          {filtered.map((entry) => (
            <li
              key={entry.id}
              className="grid gap-2 px-4 py-3 sm:grid-cols-[7.5rem_6.5rem_1fr_auto] sm:items-baseline sm:gap-4"
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
                {entry.actorDisplayName ?? tc("system")}
              </p>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
