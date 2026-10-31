"use client";

import { useState, useTransition } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "@/shared/toast";
import {
  deleteRecurringAction,
  generateRecurringAction,
} from "@/features/recurring/api/recurring";
import { RecurringForm } from "@/features/recurring/ui/recurring-form";
import type { RecurringListItem } from "@/features/recurring/model/types";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { formatDate } from "@/shared/lib/format";
import { EmptyState } from "@/shared/ui/empty-state";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Link, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { CustomerLookupItem, ServiceCatalogItem } from "@/shared/api/types";

type Props = {
  items: RecurringListItem[];
  customers: CustomerLookupItem[];
  catalogItems: ServiceCatalogItem[];
  isVatPayer: boolean;
  defaultVatRate: number;
  defaultDueDays: number;
};

export function RecurringTable({
  items,
  customers,
  catalogItems,
  isVatPayer,
  defaultVatRate,
  defaultDueDays,
}: Props) {
  const t = useTranslations("Recurring");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);

  function intervalLabel(value: RecurringListItem["interval"]) {
    if (value === "Quarterly") return t("quarterly");
    if (value === "Yearly") return t("yearly");
    return t("monthly");
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteRecurringAction({ id });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("deleteFailed"));
        return;
      }
      toast.success(t("deleted"));
      router.refresh();
    });
  }

  function generate(id: string) {
    startTransition(async () => {
      const result = await generateRecurringAction({ id });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("generateFailed"));
        return;
      }
      toast.success(t("generated", { number: result.data.number }));
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button type="button">
              <Plus className="size-4" aria-hidden />
              {t("new")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{t("new")}</DialogTitle>
            </DialogHeader>
            <RecurringForm
              customers={customers}
              catalogItems={catalogItems}
              isVatPayer={isVatPayer}
              defaultVatRate={defaultVatRate}
              defaultDueDays={defaultDueDays}
              onDone={() => {
                setCreateOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <EmptyState title={t("empty")} description={t("emptyBody")} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("customer")}</TableHead>
              <TableHead>{t("interval")}</TableHead>
              <TableHead>{t("nextRunOn")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.customerName}</TableCell>
                <TableCell>{intervalLabel(item.interval)}</TableCell>
                <TableCell className="data-num">
                  {formatDate(item.nextRunOn, locale)}
                </TableCell>
                <TableCell>
                  <Badge variant={item.isActive ? "outline" : "secondary"}>
                    {item.isActive ? t("active") : t("paused")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => generate(item.id)}
                      title={t("generateNow")}
                    >
                      <RefreshCw className="size-3.5" aria-hidden />
                    </Button>
                    {item.lastInvoiceId ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/invoices/${item.lastInvoiceId}`}>
                          {t("lastInvoice")}
                        </Link>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
