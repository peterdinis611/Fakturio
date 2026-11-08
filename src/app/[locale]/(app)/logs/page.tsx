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

const PAGE_SIZE = 50;

const ACTIONS: (AuditAction | "all")[] = [
  "all",
  "Issued",
  "Paid",
  "Cancelled",
  "Created",
  "Updated",
  "Deleted",
  "Duplicated",
  "ReminderSent",
  "CreditNoteCreated",
  "ProformaFinalized",
  "OverdueMarked",
  "RecurringGenerated",
  "CustomerCreated",
  "CustomerUpdated",
  "CustomerDeleted",
  "CompanyUpdated",
  "PaymentImportApplied",
  "ExportRequested",
  "GdprExport",
  "RecurringCreated",
  "RecurringUpdated",
  "RecurringDeleted",
  "LoginSucceeded",
];

const ENTITY_TYPES = [
  "all",
  "Invoice",
  "Customer",
  "Company",
  "Recurring",
  "PaymentImport",
  "Export",
  "Gdpr",
  "Auth",
] as const;

function buildLogsHref(opts: {
  action?: string;
  entityType?: string;
  q?: string;
  entityId?: string;
  from?: string;
  to?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (opts.action && opts.action !== "all") params.set("action", opts.action);
  if (opts.entityType && opts.entityType !== "all") {
    params.set("entityType", opts.entityType);
  }
  if (opts.q) params.set("q", opts.q);
  if (opts.entityId) params.set("entityId", opts.entityId);
  if (opts.from) params.set("from", opts.from);
  if (opts.to) params.set("to", opts.to);
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  const qs = params.toString();
  return qs ? `/logs?${qs}` : "/logs";
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string;
    q?: string;
    entityId?: string;
    entityType?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const t = await getTranslations("Logs");
  const tc = await getTranslations("Common");
  const locale = (await getLocale()) as AppLocale;
  const sp = await searchParams;

  const action =
    sp.action && sp.action !== "all" ? (sp.action as AuditAction) : undefined;
  const entityType =
    sp.entityType && sp.entityType !== "all" ? sp.entityType : undefined;
  const search = sp.q?.trim() || "";
  const entityId = sp.entityId?.trim() || undefined;
  const from = sp.from?.trim() || undefined;
  const to = sp.to?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const data = await listAuditLogs({
    page,
    pageSize: PAGE_SIZE,
    action,
    entityId,
    entityType,
    search: search || undefined,
    from,
    to,
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

      <div className="mb-2 flex flex-wrap items-center gap-1 border-b border-border pb-0">
        {ENTITY_TYPES.map((type) => {
          const active =
            (type === "all" && !entityType) || entityType === type;
          return (
            <Link
              key={type}
              href={buildLogsHref({
                action,
                entityType: type,
                q: search,
                entityId,
                from,
                to,
              })}
              className={cn(
                "px-2.5 py-2 text-[13px] transition-colors",
                active
                  ? "border-b-2 border-ink font-medium text-ink"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              {type === "all" ? tc("all") : t(`entity.${type}`)}
            </Link>
          );
        })}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-border pb-0">
        {ACTIONS.map((a) => {
          const active = (a === "all" && !action) || action === a;
          return (
            <Link
              key={a}
              href={buildLogsHref({
                action: a,
                entityType,
                q: search,
                entityId,
                from,
                to,
              })}
              className={cn(
                "px-2.5 py-2 text-[12px] transition-colors",
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

      {(from || to || entityId) && (
        <p className="mb-3 text-[12px] text-muted-foreground">
          {entityId ? t("filteredEntity", { id: entityId }) : null}
          {from || to
            ? t("filteredRange", { from: from ?? "…", to: to ?? "…" })
            : null}{" "}
          <Link href="/logs" className="text-ink underline-offset-2 hover:underline">
            {t("clearFilters")}
          </Link>
        </p>
      )}

      <LogsFuzzyList
        items={data.items}
        initialQuery={search}
        action={action}
        entityId={entityId}
        entityType={entityType}
        from={from}
        to={to}
        truncated={data.totalCount > data.items.length}
        totalCount={data.totalCount}
        page={data.page}
        pageSize={data.pageSize}
        totalPages={data.totalPages}
      />
    </div>
  );
}
