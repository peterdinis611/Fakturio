import Link from "next/link";
import { getReminders } from "@/actions/invoices";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  MarkReminderSentButton,
  SyncOverdueButton,
} from "@/components/reminders/reminder-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Upomienky" };

export default async function RemindersPage({
  searchParams,
}: {
  searchParams: Promise<{ within?: string; overdue?: string }>;
}) {
  const sp = await searchParams;
  const withinDays = Number(sp.within) || 7;
  const onlyOverdue = sp.overdue === "1";
  const reminders = await getReminders({ withinDays, onlyOverdue });

  return (
    <div>
      <PageHeader
        title="Upomienky"
        description={
          onlyOverdue
            ? "Len po splatnosti: sync stavov a označ odoslanú upomienku."
            : `Splatnosti v najbližších ${withinDays} dňoch.`
        }
        actions={<SyncOverdueButton />}
      />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {[7, 14, 30].map((d) => (
          <Link
            key={d}
            href={`/reminders?within=${d}${onlyOverdue ? "&overdue=1" : ""}`}
            className={cn(
              "relative -mb-px border-b-2 px-2.5 py-2 text-[13px] font-medium",
              withinDays === d
                ? "border-ink text-ink"
                : "border-transparent text-muted-foreground hover:text-ink",
            )}
          >
            {d} dní
          </Link>
        ))}
        <div className="flex-1" />
        <Link
          href={
            onlyOverdue
              ? `/reminders?within=${withinDays}`
              : `/reminders?within=${withinDays}&overdue=1`
          }
          className={cn(
            "mb-1 self-center rounded-[6px] px-2 py-1 text-[12px] font-medium",
            onlyOverdue
              ? "bg-pill-negative-bg text-pill-negative-ink"
              : "text-muted-foreground hover:bg-raised",
          )}
        >
          Len po splatnosti
        </Link>
      </div>

      {reminders.length === 0 ? (
        <EmptyState
          title="Žiadne upomienky"
          description="V zvolenom horizonte nie sú splatné ani omeškané faktúry."
          actionLabel="Faktúry"
          actionHref="/invoices"
        />
      ) : (
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[12px] text-muted-foreground">
                  Číslo
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  Zákazník
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  Stav
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  Splatnosť
                </TableHead>
                <TableHead className="text-right text-[12px] text-muted-foreground">
                  Dni
                </TableHead>
                <TableHead className="text-right text-[12px] text-muted-foreground">
                  Suma
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  Odoslané
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((r) => (
                <TableRow key={r.id} className="h-11">
                  <TableCell>
                    <Link
                      href={`/invoices/${r.id}`}
                      className="data-num font-medium hover:underline"
                    >
                      {r.number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p>{r.customerName}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {r.customerEmail ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell>{formatDate(r.dueDate)}</TableCell>
                  <TableCell
                    className={cn(
                      "data-num text-right",
                      r.isOverdue && "text-negative",
                    )}
                  >
                    {r.daysUntilDue}
                  </TableCell>
                  <TableCell className="money text-right">
                    {formatMoney(r.total, r.currency)}
                  </TableCell>
                  <TableCell className="text-[12px] text-muted-foreground">
                    {r.reminderCount}×
                    {r.lastReminderSentAt
                      ? ` · ${formatDateTime(r.lastReminderSentAt)}`
                      : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <MarkReminderSentButton invoiceId={r.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
