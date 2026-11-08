import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatDate, formatMoney } from "@/shared/lib/format";
import type { AppLocale } from "@/i18n/routing";
import type { AdminOverview } from "@/shared/api/types";
import { MotionItem } from "@/shared/ui/motion/page-motion";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 data-num text-[22px] font-semibold leading-none text-ink">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function JobLine({
  name,
  enabled,
  lastRun,
  message,
  locale,
}: {
  name: string;
  enabled: boolean;
  lastRun: string | null;
  message: string | null;
  locale: AppLocale;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/70 py-2 last:border-0">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink">{name}</p>
        {message ? (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
            {message}
          </p>
        ) : null}
      </div>
      <div className="text-right text-[12px] text-muted-foreground">
        <p className={enabled ? "text-ink" : ""}>
          {enabled ? "on" : "off"}
        </p>
        <p className="data-num">
          {lastRun ? formatDate(lastRun, locale) : "—"}
        </p>
      </div>
    </div>
  );
}

export async function AdminOverviewBody({
  dataPromise,
}: {
  dataPromise: Promise<AdminOverview>;
}) {
  const t = await getTranslations("Admin");
  const locale = (await getLocale()) as AppLocale;
  const data = await dataPromise;
  const { health, counts, invoices, recentUsers, jobs } = data;

  return (
    <div className="space-y-8">
      <MotionItem>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
              {t("system")}
            </p>
            <p className="mt-1 text-[18px] font-semibold text-ink">
              {health.status === "ok" ? t("healthy") : t("degraded")}
              <span className="ml-2 text-[13px] font-normal text-muted-foreground">
                DB {health.database}
              </span>
            </p>
          </div>
          <p className="data-num text-[12px] text-muted-foreground">
            {formatDate(data.generatedAtUtc, locale)}
          </p>
        </div>
      </MotionItem>

      <MotionItem>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label={t("users")} value={String(counts.users)} />
          <Stat label={t("companies")} value={String(counts.companies)} />
          <Stat label={t("customers")} value={String(counts.customers)} />
          <Stat label={t("invoices")} value={String(counts.invoices)} />
          <Stat
            label={t("recurring")}
            value={String(counts.recurringTemplates)}
          />
          <Stat label={t("catalog")} value={String(counts.catalogItems)} />
          <Stat label={t("notes")} value={String(counts.notes)} />
          <Stat label={t("audit")} value={String(counts.auditLogs)} />
        </div>
      </MotionItem>

      <MotionItem>
        <section className="border-t border-border pt-5">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t("invoiceMix")}
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label={t("openAmount")}
              value={formatMoney(invoices.openAmount, invoices.currency, locale)}
              hint={`${invoices.issued} ${t("issued")} · ${invoices.overdue} ${t("overdue")}`}
            />
            <Stat
              label={t("paidAmount")}
              value={formatMoney(invoices.paidAmount, invoices.currency, locale)}
              hint={`${invoices.paid} ${t("paid")}`}
            />
            <Stat
              label={t("pipeline")}
              value={`${invoices.draft} / ${invoices.cancelled}`}
              hint={`${t("draft")} / ${t("cancelled")}`}
            />
          </div>
        </section>
      </MotionItem>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <MotionItem>
          <section className="border-t border-border pt-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {t("recentUsers")}
              </h2>
              <Link
                href="/admin/users"
                className="text-[12px] text-muted-foreground underline-offset-2 hover:text-ink hover:underline"
              >
                {t("allUsers")}
              </Link>
            </div>
            <div className="mt-3 divide-y divide-border/80">
              {recentUsers.length === 0 ? (
                <p className="py-3 text-[13px] text-muted-foreground">
                  {t("noUsers")}
                </p>
              ) : (
                recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {u.email}
                        {u.isAdmin ? (
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                            admin
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {u.companyName || t("noCompany")}
                      </p>
                    </div>
                    <p className="data-num text-[11px] text-muted-foreground">
                      {formatDate(u.createdAt, locale)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </MotionItem>

        <MotionItem>
          <section className="border-t border-border pt-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {t("jobs")}
              </h2>
              <Link
                href="/settings/jobs"
                className="text-[12px] text-muted-foreground underline-offset-2 hover:text-ink hover:underline"
              >
                {t("jobSettings")}
              </Link>
            </div>
            <div className="mt-2">
              <JobLine
                name={t("jobOverdue")}
                enabled={jobs.overdueSync.enabled}
                lastRun={jobs.overdueSyncRun.lastRunAtUtc}
                message={jobs.overdueSyncRun.lastMessage}
                locale={locale}
              />
              <JobLine
                name={t("jobReminder")}
                enabled={jobs.reminderJob.enabled}
                lastRun={jobs.reminderJobRun.lastRunAtUtc}
                message={jobs.reminderJobRun.lastMessage}
                locale={locale}
              />
              <JobLine
                name={t("jobRecurring")}
                enabled={jobs.recurringInvoices.enabled}
                lastRun={jobs.recurringInvoicesRun.lastRunAtUtc}
                message={jobs.recurringInvoicesRun.lastMessage}
                locale={locale}
              />
            </div>
          </section>
        </MotionItem>
      </div>
    </div>
  );
}
