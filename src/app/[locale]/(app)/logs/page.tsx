import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { listAuditLogs } from "@/features/logs/api/logs";
import { LogsFuzzyList } from "@/features/logs/ui/logs-fuzzy-list";
import { PageHeader } from "@/widgets/app-shell/page-header";
import type { AuditAction } from "@/shared/api/types";
import { auditActionLabel } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata() {
  const t = await getTranslations("Logs");
  return { title: t("title") };
}

const CATALOG_SIZE = 500;

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

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string;
    q?: string;
    entityId?: string;
  }>;
}) {
  const t = await getTranslations("Logs");
  const tc = await getTranslations("Common");
  const locale = (await getLocale()) as AppLocale;
  const sp = await searchParams;
  const action =
    sp.action && sp.action !== "all" ? (sp.action as AuditAction) : undefined;
  const search = sp.q?.trim() || "";
  const entityId = sp.entityId?.trim() || undefined;

  const data = await listAuditLogs({
    page: 1,
    pageSize: CATALOG_SIZE,
    action,
    entityId,
  });

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        ledger={
          <>
            <span>{t("ledgerCount", { count: data.totalCount })}</span>
            <span>{t("ledgerTrail")}</span>
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
              {a === "all" ? tc("all") : auditActionLabel(a, locale)}
            </Link>
          );
        })}
      </div>

      <LogsFuzzyList
        items={data.items}
        initialQuery={search}
        action={action}
        entityId={entityId}
        truncated={data.totalCount > data.items.length}
      />
    </div>
  );
}
