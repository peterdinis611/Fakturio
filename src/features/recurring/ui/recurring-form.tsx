"use client";

import { useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "@/shared/toast";
import {
  createRecurringAction,
  updateRecurringAction,
} from "@/features/recurring/api/recurring";
import {
  recurringSchema,
  type RecurringFormInput,
  type RecurringFormValues,
  type RecurringInvoice,
} from "@/features/recurring/model/types";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { CustomerLookupItem, ServiceCatalogItem } from "@/shared/api/types";

type Props = {
  customers: CustomerLookupItem[];
  catalogItems: ServiceCatalogItem[];
  isVatPayer: boolean;
  defaultVatRate: number;
  defaultDueDays: number;
  initial?: RecurringInvoice | null;
  onDone?: () => void;
};

export function RecurringForm({
  customers,
  catalogItems,
  isVatPayer,
  defaultVatRate,
  defaultDueDays,
  initial,
  onDone,
}: Props) {
  const t = useTranslations("Recurring");
  const [pending, startTransition] = useTransition();
  const form = useForm<RecurringFormInput, unknown, RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    defaultValues: initial
      ? {
          customerId: initial.customerId,
          name: initial.name,
          interval: initial.interval,
          dayOfMonth: initial.dayOfMonth,
          dueDays: initial.dueDays,
          nextRunOn: initial.nextRunOn,
          isActive: initial.isActive,
          notes: initial.notes,
          items: initial.items.map((i) => ({
            serviceCatalogItemId: i.serviceCatalogItemId,
            description: i.description,
            unit: i.unit,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            vatRate: i.vatRate,
          })),
        }
      : {
          customerId: customers[0]?.id ?? "",
          name: "",
          interval: "Monthly",
          dayOfMonth: 1,
          dueDays: defaultDueDays,
          isActive: true,
          notes: "",
          items: [
            {
              description: catalogItems[0]?.description ?? "",
              unit: catalogItems[0]?.unit ?? "ks",
              quantity: 1,
              unitPrice: catalogItems[0]?.unitPrice ?? 0,
              vatRate: isVatPayer
                ? (catalogItems[0]?.vatRate ?? defaultVatRate)
                : 0,
              serviceCatalogItemId: catalogItems[0]?.id ?? null,
            },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  function onSubmit(values: RecurringFormValues) {
    startTransition(async () => {
      const result = initial
        ? await updateRecurringAction({ ...values, id: initial.id })
        : await createRecurringAction(values);
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("saveFailed"));
        return;
      }
      toast.success(initial ? t("updated") : t("created"));
      onDone?.();
    });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" {...form.register("name")} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="customerId">{t("customer")}</Label>
          <select
            id="customerId"
            className="flex h-9 w-full rounded-[4px] border border-border bg-surface px-3 text-[13px]"
            {...form.register("customerId")}
          >
            <option value="">{t("customerPlaceholder")}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="interval">{t("interval")}</Label>
          <select
            id="interval"
            className="flex h-9 w-full rounded-[4px] border border-border bg-surface px-3 text-[13px]"
            {...form.register("interval")}
          >
            <option value="Monthly">{t("monthly")}</option>
            <option value="Quarterly">{t("quarterly")}</option>
            <option value="Yearly">{t("yearly")}</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dayOfMonth">{t("dayOfMonth")}</Label>
          <Input
            id="dayOfMonth"
            type="number"
            min={1}
            max={28}
            {...form.register("dayOfMonth", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDays">{t("dueDays")}</Label>
          <Input
            id="dueDays"
            type="number"
            min={0}
            max={365}
            {...form.register("dueDays", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nextRunOn">{t("nextRunOn")}</Label>
          <Input id="nextRunOn" type="date" {...form.register("nextRunOn")} />
        </div>
      </div>

      {catalogItems.length > 0 ? (
        <div className="space-y-1.5">
          <Label htmlFor="add-catalog">{t("fromCatalog")}</Label>
          <select
            id="add-catalog"
            className="flex h-9 w-full rounded-[4px] border border-border bg-surface px-3 text-[13px]"
            defaultValue=""
            onChange={(e) => {
              const item = catalogItems.find((c) => c.id === e.target.value);
              e.target.value = "";
              if (!item) return;
              append({
                serviceCatalogItemId: item.id,
                description: item.description,
                unit: item.unit,
                quantity: 1,
                unitPrice: item.unitPrice,
                vatRate: isVatPayer ? item.vatRate : 0,
              });
            }}
          >
            <option value="">{t("catalogPlaceholder")}</option>
            {catalogItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.description}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
            {t("items")}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              append({
                description: "",
                unit: "ks",
                quantity: 1,
                unitPrice: 0,
                vatRate: isVatPayer ? defaultVatRate : 0,
              })
            }
          >
            <Plus className="size-3.5" aria-hidden />
            {t("addLine")}
          </Button>
        </div>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-2 rounded-[4px] border border-border p-2 sm:grid-cols-[1fr_4rem_5rem_4.5rem_auto]"
          >
            <Input
              placeholder={t("description")}
              {...form.register(`items.${index}.description`)}
            />
            <Input placeholder={t("unit")} {...form.register(`items.${index}.unit`)} />
            <Input
              type="number"
              step="any"
              {...form.register(`items.${index}.quantity`, {
                valueAsNumber: true,
              })}
            />
            <Input
              type="number"
              step="any"
              {...form.register(`items.${index}.unitPrice`, {
                valueAsNumber: true,
              })}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={fields.length <= 1}
              onClick={() => remove(index)}
            >
              <Trash2 className="size-3.5" aria-hidden />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}
