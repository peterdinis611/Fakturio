"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon } from "lucide-react";
import {
  createInvoiceAction,
  updateInvoiceAction,
} from "@/actions/invoices";
import type { Invoice } from "@/lib/api/types";
import type { z } from "zod";
import {
  invoiceSchema,
  type InvoiceFormValues,
} from "@/lib/validations/invoice";

type InvoiceFormInput = z.input<typeof invoiceSchema>;
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CompanyDefaults = {
  defaultVatRate: number;
  defaultCurrency: string;
  defaultPaymentMethod: string | null;
  bankIban: string | null;
  bankBic: string | null;
  defaultDueDays: number;
};

type InvoiceFormProps = {
  customers: { id: string; name: string }[];
  initial?: Invoice | null;
  companyDefaults?: CompanyDefaults;
  defaultCustomerId?: string;
};

function dateInputValue(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

function addDaysIso(from: string, days: number) {
  const d = new Date(`${from}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function toFormValues(
  initial: Invoice | null | undefined,
  companyDefaults?: CompanyDefaults,
  defaultCustomerId?: string,
): InvoiceFormInput {
  const today = new Date().toISOString().slice(0, 10);
  const dueDays = companyDefaults?.defaultDueDays ?? 14;

  if (initial?.id) {
    return {
      customerId: initial.customerId,
      issueDate: dateInputValue(initial.issueDate),
      dueDate: dateInputValue(initial.dueDate),
      deliveryDate: dateInputValue(initial.deliveryDate),
      currency: initial.currency,
      variableSymbol: initial.variableSymbol ?? "",
      constantSymbol: initial.constantSymbol ?? "",
      specificSymbol: initial.specificSymbol ?? "",
      paymentMethod: initial.paymentMethod ?? "",
      bankIban: initial.bankIban ?? "",
      bankBic: initial.bankBic ?? "",
      notes: initial.notes ?? "",
      items: initial.items.map((item) => ({
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
      })),
    };
  }

  return {
    customerId: defaultCustomerId ?? "",
    issueDate: today,
    dueDate: addDaysIso(today, dueDays),
    deliveryDate: "",
    currency: companyDefaults?.defaultCurrency ?? "EUR",
    variableSymbol: "",
    constantSymbol: "",
    specificSymbol: "",
    paymentMethod: companyDefaults?.defaultPaymentMethod ?? "",
    bankIban: companyDefaults?.bankIban ?? "",
    bankBic: companyDefaults?.bankBic ?? "",
    notes: "",
    items: [
      {
        description: "",
        unit: "ks",
        quantity: 1,
        unitPrice: 0,
        vatRate: companyDefaults?.defaultVatRate ?? 23,
      },
    ],
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function lineTotal(quantity: number, unitPrice: number, vatRate: number | null | undefined) {
  const sub = quantity * unitPrice;
  const rate = vatRate ?? 0;
  return sub + sub * (rate / 100);
}

export function InvoiceForm({
  customers,
  initial,
  companyDefaults,
  defaultCustomerId,
}: InvoiceFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initial?.id);
  const readOnly = isEdit && initial!.status !== "Draft";

  const form = useForm<InvoiceFormInput, unknown, InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: toFormValues(initial, companyDefaults, defaultCustomerId),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const currency = watch("currency") || "EUR";

  const grandTotal = useMemo(() => {
    return (watchedItems ?? []).reduce(
      (sum, item) =>
        sum +
        lineTotal(
          Number(item.quantity) || 0,
          Number(item.unitPrice) || 0,
          item.vatRate != null ? Number(item.vatRate) : 0,
        ),
      0,
    );
  }, [watchedItems]);

  function applyFieldErrors(fieldErrors?: Record<string, string>) {
    if (!fieldErrors) return;
    for (const [key, message] of Object.entries(fieldErrors)) {
      setError(key as keyof InvoiceFormValues, { message });
    }
  }

  function submit(values: InvoiceFormValues, status?: "Draft" | "Issued") {
    startTransition(async () => {
      const result = isEdit
        ? await updateInvoiceAction(initial!.id, values)
        : await createInvoiceAction(values, status ?? "Draft");

      if (!result.ok) {
        toast.error(result.message);
        applyFieldErrors(result.fieldErrors);
        return;
      }

      if (isEdit) {
        toast.success("Faktúra bola uložená");
        router.refresh();
        return;
      }

      toast.success(
        status === "Issued" ? "Faktúra bola vystavená" : "Koncept bol vytvorený",
      );
      router.push(`/invoices/${result.data.id}`);
    });
  }

  const fieldClass = "flex flex-col gap-1.5";

  return (
    <form className="flex flex-col gap-6" noValidate>
      {readOnly ? (
        <p className="panel border-signal/30 bg-signal/5 px-4 py-3 text-sm text-muted-foreground">
          Túto faktúru nie je možné upravovať: stav{" "}
          <span className="font-medium text-signal">{initial!.status}</span>.
        </p>
      ) : null}

      <section className="panel flex flex-col gap-4 p-4">
        <h2 className="font-heading text-sm font-medium">Základné údaje</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={cn(fieldClass, "sm:col-span-2")}>
            <Label>Zákazník</Label>
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={readOnly || pending}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!errors.customerId}>
                    <SelectValue placeholder="Vyber zákazníka" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.customerId?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="issueDate">Dátum vystavenia</Label>
            <Input
              id="issueDate"
              type="date"
              disabled={readOnly || pending}
              {...register("issueDate")}
            />
            <FieldError message={errors.issueDate?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="dueDate">Dátum splatnosti</Label>
            <Input
              id="dueDate"
              type="date"
              disabled={readOnly || pending}
              {...register("dueDate")}
            />
            <FieldError message={errors.dueDate?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="deliveryDate">Dátum dodania</Label>
            <Input
              id="deliveryDate"
              type="date"
              disabled={readOnly || pending}
              {...register("deliveryDate")}
            />
            <FieldError message={errors.deliveryDate?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="currency">Mena</Label>
            <Input
              id="currency"
              maxLength={3}
              disabled={readOnly || pending}
              className="data-num uppercase"
              {...register("currency")}
            />
            <FieldError message={errors.currency?.message} />
          </div>
        </div>
      </section>

      <section className="panel flex flex-col gap-4 p-4">
        <h2 className="font-heading text-sm font-medium">Platba</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={fieldClass}>
            <Label htmlFor="variableSymbol">Variabilný symbol</Label>
            <Input
              id="variableSymbol"
              className="data-num"
              disabled={readOnly || pending}
              {...register("variableSymbol")}
            />
            <FieldError message={errors.variableSymbol?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="constantSymbol">Konštantný symbol</Label>
            <Input
              id="constantSymbol"
              className="data-num"
              disabled={readOnly || pending}
              {...register("constantSymbol")}
            />
            <FieldError message={errors.constantSymbol?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="specificSymbol">Špecifický symbol</Label>
            <Input
              id="specificSymbol"
              className="data-num"
              disabled={readOnly || pending}
              {...register("specificSymbol")}
            />
            <FieldError message={errors.specificSymbol?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="paymentMethod">Spôsob platby</Label>
            <Input
              id="paymentMethod"
              disabled={readOnly || pending}
              {...register("paymentMethod")}
            />
            <FieldError message={errors.paymentMethod?.message} />
          </div>
          <div className={cn(fieldClass, "sm:col-span-2")}>
            <Label htmlFor="bankIban">IBAN</Label>
            <Input
              id="bankIban"
              className="data-num text-sm"
              disabled={readOnly || pending}
              {...register("bankIban")}
            />
            <FieldError message={errors.bankIban?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="bankBic">BIC</Label>
            <Input
              id="bankBic"
              className="data-num text-sm"
              disabled={readOnly || pending}
              {...register("bankBic")}
            />
            <FieldError message={errors.bankBic?.message} />
          </div>
        </div>
      </section>

      <section className="panel flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-sm font-medium">Položky</h2>
          {!readOnly ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() =>
                append({
                  description: "",
                  unit: "ks",
                  quantity: 1,
                  unitPrice: 0,
                  vatRate: companyDefaults?.defaultVatRate ?? 23,
                })
              }
            >
              <PlusIcon />
              Pridať položku
            </Button>
          ) : null}
        </div>

        <FieldError message={errors.items?.message ?? errors.items?.root?.message} />

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 border border-border bg-background/50 p-3 sm:grid-cols-12"
            >
              <div className={cn(fieldClass, "sm:col-span-5")}>
                <Label htmlFor={`items.${index}.description`}>Popis</Label>
                <Input
                  id={`items.${index}.description`}
                  disabled={readOnly || pending}
                  {...register(`items.${index}.description`)}
                />
                <FieldError message={errors.items?.[index]?.description?.message} />
              </div>
              <div className={cn(fieldClass, "sm:col-span-1")}>
                <Label htmlFor={`items.${index}.unit`}>Mj.</Label>
                <Input
                  id={`items.${index}.unit`}
                  disabled={readOnly || pending}
                  {...register(`items.${index}.unit`)}
                />
              </div>
              <div className={cn(fieldClass, "sm:col-span-2")}>
                <Label htmlFor={`items.${index}.quantity`}>Množstvo</Label>
                <Input
                  id={`items.${index}.quantity`}
                  type="number"
                  min={0}
                  step="any"
                  className="data-num"
                  disabled={readOnly || pending}
                  {...register(`items.${index}.quantity`)}
                />
                <FieldError message={errors.items?.[index]?.quantity?.message} />
              </div>
              <div className={cn(fieldClass, "sm:col-span-2")}>
                <Label htmlFor={`items.${index}.unitPrice`}>Cena / mj.</Label>
                <Input
                  id={`items.${index}.unitPrice`}
                  type="number"
                  min={0}
                  step="0.01"
                  className="data-num"
                  disabled={readOnly || pending}
                  {...register(`items.${index}.unitPrice`)}
                />
                <FieldError message={errors.items?.[index]?.unitPrice?.message} />
              </div>
              <div className={cn(fieldClass, "sm:col-span-1")}>
                <Label htmlFor={`items.${index}.vatRate`}>DPH</Label>
                <Input
                  id={`items.${index}.vatRate`}
                  type="number"
                  min={0}
                  max={100}
                  className="data-num"
                  disabled={readOnly || pending}
                  {...register(`items.${index}.vatRate`)}
                />
              </div>
              <div className="flex items-end justify-between gap-2 sm:col-span-1 sm:flex-col sm:items-stretch">
                <p className="data-num text-right text-sm font-medium text-signal sm:text-left">
                  {formatMoney(
                    lineTotal(
                      Number(watchedItems?.[index]?.quantity) || 0,
                      Number(watchedItems?.[index]?.unitPrice) || 0,
                      watchedItems?.[index]?.vatRate != null
                        ? Number(watchedItems[index].vatRate)
                        : 0,
                    ),
                    currency,
                  )}
                </p>
                {!readOnly && fields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={pending}
                    aria-label="Odstrániť položku"
                    onClick={() => remove(index)}
                  >
                    <Trash2Icon className="text-destructive" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="ledger-strip justify-end border-b-0 pb-0">
          <span>Celkom s DPH</span>
          <span className="data-num text-base font-semibold text-signal">
            {formatMoney(grandTotal, currency)}
          </span>
        </div>
      </section>

      <section className="panel flex flex-col gap-4 p-4">
        <h2 className="font-heading text-sm font-medium">Poznámka</h2>
        <Textarea
          rows={4}
          disabled={readOnly || pending}
          {...register("notes")}
        />
        <FieldError message={errors.notes?.message} />
      </section>

      {!readOnly ? (
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          {isEdit ? (
            <Button
              type="button"
              disabled={pending}
              onClick={handleSubmit((values) => submit(values))}
            >
              Uložiť koncept
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={handleSubmit((values) => submit(values, "Draft"))}
              >
                Uložiť koncept
              </Button>
              <Button
                type="button"
                disabled={pending}
                onClick={handleSubmit((values) => submit(values, "Issued"))}
              >
                Vytvoriť a vystaviť
              </Button>
            </>
          )}
        </div>
      ) : null}
    </form>
  );
}
