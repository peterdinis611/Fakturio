import Link from "next/link";
import { AlertCircle, Clock3, Mail } from "lucide-react";
import { getReminders } from "@/actions/invoices";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/page-motion";
import {
  MarkReminderSentButton,
  SyncOverdueButton,
} from "@/components/reminders/reminder-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { InvoiceReminder } from "@/lib/api/types";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Upomienky" };

const HORIZONS = [7, 14, 30] as const;

function daysLabel(r: InvoiceReminder) {
  if (r.isOverdue) {
    const days = Math.abs(r.daysUntilDue);
    return days === 0 ? "Dnes po splatnosti" : `${days} d po splatnosti`;
  }
  if (r.daysUntilDue === 0) return "Splatné dnes";
  if (r.daysUntilDue === 1) return "Zajtra";
  return `O ${r.daysUntilDue} dní`;
}

function ReminderRow({ r }: { r: InvoiceReminder }) {
  return (
    <li
      className={cn(
        "flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        r.isOverdue && "bg-pill-negative-bg/40",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "stamp mt-0.5 shrink-0",
            r.isOverdue
              ? "border-negative text-negative"
              : "border-ink text-ink",
          )}
        >
          {r.isOverdue ? "!" : "F"}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/invoices/${r.id}`}
              className="data-num font-medium text-ink hover:underline"
            >
              {r.number}
            </Link>
            <StatusBadge status={r.status} />
          </div>
          <p className="mt-0.5 truncate text-[14px] text-ink">
            {r.customerName}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-muted-foreground">
            <span>Splatnosť {formatDate(r.dueDate)}</span>
            {r.customerEmail ? (
              <span className="inline-flex items-center gap-1 truncate">
                <Mail className="size-3" aria-hidden />
                {r.customerEmail}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <div className="min-w-[7rem] text-left sm:text-right">
          <p
            className={cn(
              "text-[13px] font-medium",
              r.isOverdue ? "text-negative" : "text-ink",
            )}
          >
            {daysLabel(r)}
          </p>
          <p className="money text-[15px] text-ink">
            {formatMoney(r.total, r.currency)}
          </p>
          <p className="mt-0.5 text-[11px] text-faint">
            {r.reminderCount > 0
              ? `${r.reminderCount}× odoslané${
                  r.lastReminderSentAt
                    ? ` · ${formatDateTime(r.lastReminderSentAt)}`
                    : ""
                }`
              : "Ešte neodoslané"}
          </p>
        </div>
        <MarkReminderSentButton invoiceId={r.id} />
      </div>
    </li>
  );
}

function ReminderGroup({
  title,
  hint,
  tone,
  items,
}: {
  title: string;
  hint: string;
  tone: "danger" | "neutral";
  items: InvoiceReminder[];
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2
          className={cn(
            "flex items-center gap-1.5 text-[13px] font-medium tracking-wide uppercase",
            tone === "danger" ? "text-negative" : "text-muted-foreground",
          )}
        >
          {tone === "danger" ? (
            <AlertCircle className="size-3.5" aria-hidden />
          ) : (
            <Clock3 className="size-3.5" aria-hidden />
          )}
          {title}
        </h2>
        <span className="text-[12px] text-faint">{hint}</span>
      </div>
      <ul className="panel divide-y divide-rule overflow-hidden">
        {items.map((r) => (
          <ReminderRow key={r.id} r={r} />
        ))}
      </ul>
    </section>
  );
}

export default async function RemindersPage({
  searchParams,
}: {
  searchParams: Promise<{ within?: string; overdue?: string }>;
}) {
  const sp = await searchParams;
  const withinRaw = Number(sp.within);
  const withinDays = HORIZONS.includes(withinRaw as (typeof HORIZONS)[number])
    ? withinRaw
    : 7;
  const onlyOverdue = sp.overdue === "1";
  const reminders = await getReminders({ withinDays, onlyOverdue });

  const overdue = reminders.filter((r) => r.isOverdue);
  const upcoming = reminders.filter((r) => !r.isOverdue);
  const overdueSum = overdue.reduce((s, r) => s + r.total, 0);
  const upcomingSum = upcoming.reduce((s, r) => s + r.total, 0);
  const currency = reminders[0]?.currency ?? "EUR";

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Upomienky"
        description={
          onlyOverdue
            ? "Len faktúry po splatnosti — sync stavov a označ odoslanie."
            : `Splatnosti v najbližších ${withinDays} dňoch a omeškané.`
        }
        actions={<SyncOverdueButton />}
        ledger={
          reminders.length > 0 ? (
            <>
              <span className="data-num">{reminders.length} položiek</span>
              {overdue.length > 0 ? (
                <span className="text-negative">
                  {overdue.length} po splatnosti ·{" "}
                  <span className="money">
                    {formatMoney(overdueSum, currency)}
                  </span>
                </span>
              ) : (
                <span className="text-positive">Nič omeškané</span>
              )}
              {!onlyOverdue && upcoming.length > 0 ? (
                <span>
                  {upcoming.length} blíži sa ·{" "}
                  <span className="money">
                    {formatMoney(upcomingSum, currency)}
                  </span>
                </span>
              ) : null}
            </>
          ) : undefined
        }
      />

      <FadeIn delay={0.04}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border">
          <div className="flex flex-wrap gap-1">
            {HORIZONS.map((d) => (
              <Link
                key={d}
                href={`/reminders?within=${d}${onlyOverdue ? "&overdue=1" : ""}`}
                className={cn(
                  "relative -mb-px border-b-2 px-2.5 py-2.5 text-[13px] font-medium",
                  withinDays === d
                    ? "border-ink text-ink"
                    : "border-transparent text-muted-foreground hover:text-ink",
                )}
              >
                {d} dní
              </Link>
            ))}
          </div>
          <Link
            href={
              onlyOverdue
                ? `/reminders?within=${withinDays}`
                : `/reminders?within=${withinDays}&overdue=1`
            }
            className={cn(
              "mb-2 inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
              onlyOverdue
                ? "border-negative/40 bg-pill-negative-bg text-negative"
                : "border-border text-muted-foreground hover:border-control hover:text-ink",
            )}
          >
            <AlertCircle className="size-3.5" aria-hidden />
            Len po splatnosti
          </Link>
        </div>
      </FadeIn>

      {reminders.length === 0 ? (
        <FadeIn delay={0.08}>
          <div className="border-t border-rule pt-8">
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="stamp mt-0.5 border-muted text-muted-foreground"
              >
                ✓
              </span>
              <div>
                <p className="text-[16px] font-medium text-ink">
                  {onlyOverdue
                    ? "Žiadne omeškané faktúry"
                    : "Žiadne upomienky v horizonte"}
                </p>
                <p className="mt-1 max-w-md text-[14px] text-muted-foreground">
                  {onlyOverdue
                    ? "Všetky splatnosti sú v poriadku. Môžeš synchronizovať stavy alebo skontrolovať faktúry."
                    : `V najbližších ${withinDays} dňoch nie sú splatné ani omeškané faktúry.`}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/invoices">Faktúry</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/invoices?status=Issued">Vystavené</Link>
                  </Button>
                </div>
              </div>
            </div>

            <ul className="mt-8 grid gap-2 text-[13px] sm:grid-cols-3">
              <li className="border border-dashed border-border px-3 py-3">
                <p className="text-faint">Horizont</p>
                <p className="mt-0.5 font-medium text-ink">{withinDays} dní</p>
              </li>
              <li className="border border-dashed border-border px-3 py-3">
                <p className="text-faint">Filter</p>
                <p className="mt-0.5 font-medium text-ink">
                  {onlyOverdue ? "Len po splatnosti" : "Blížiace + omeškané"}
                </p>
              </li>
              <li className="border border-dashed border-border px-3 py-3">
                <p className="text-faint">Akcia</p>
                <p className="mt-0.5 font-medium text-ink">
                  Obnoviť omeškané hore
                </p>
              </li>
            </ul>
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.08} className="space-y-8">
          {onlyOverdue ? (
            <ReminderGroup
              title="Po splatnosti"
              hint={`${overdue.length} · ${formatMoney(overdueSum, currency)}`}
              tone="danger"
              items={overdue}
            />
          ) : (
            <>
              <ReminderGroup
                title="Po splatnosti"
                hint={`${overdue.length} · ${formatMoney(overdueSum, currency)}`}
                tone="danger"
                items={overdue}
              />
              <ReminderGroup
                title="Blížiaca sa splatnosť"
                hint={`${upcoming.length} · ${formatMoney(upcomingSum, currency)}`}
                tone="neutral"
                items={upcoming}
              />
            </>
          )}
        </FadeIn>
      )}
    </div>
  );
}
