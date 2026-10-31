"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileText,
  Mail,
  UserRound,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "@/shared/toast";
import { CreateCustomerDialog } from "@/features/customers/ui/create-customer-dialog";
import { createInvoiceAction } from "@/features/invoices/api/invoices";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { formatMoney } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type {
  CustomerLookupItem,
  Invoice,
  ServiceCatalogItem,
} from "@/shared/api/types";

type Step = 1 | 2 | 3;

type Props = {
  customers: CustomerLookupItem[];
  catalogItems: ServiceCatalogItem[];
  defaultVatRate: number;
  isVatPayer: boolean;
  defaultCurrency: string;
};

export function FirstInvoiceWizard({
  customers: initialCustomers,
  catalogItems,
  defaultVatRate,
  isVatPayer,
  defaultCurrency,
}: Props) {
  const t = useTranslations("FirstInvoice");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(1);
  const [customers, setCustomers] = useState(initialCustomers);
  const [customerId, setCustomerId] = useState(initialCustomers[0]?.id ?? "");
  const [description, setDescription] = useState(
    catalogItems[0]?.description ?? "",
  );
  const [unit, setUnit] = useState(catalogItems[0]?.unit ?? "ks");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(catalogItems[0]?.unitPrice ?? 0);
  const [vatRate, setVatRate] = useState(
    isVatPayer ? (catalogItems[0]?.vatRate ?? defaultVatRate) : 0,
  );
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const selected = customers.find((c) => c.id === customerId);
  const lineTotal = useMemo(() => {
    const sub = quantity * unitPrice;
    const vat = isVatPayer ? (sub * vatRate) / 100 : 0;
    return Math.round((sub + vat) * 100) / 100;
  }, [quantity, unitPrice, vatRate, isVatPayer]);

  function applyCatalog(id: string) {
    const item = catalogItems.find((c) => c.id === id);
    if (!item) return;
    setDescription(item.description);
    setUnit(item.unit);
    setUnitPrice(item.unitPrice);
    setVatRate(isVatPayer ? item.vatRate : 0);
  }

  function issue() {
    if (!customerId || !description.trim()) {
      toast.error(t("fillRequired"));
      return;
    }
    startTransition(async () => {
      const result = await createInvoiceAction({
        customerId,
        issueDate: undefined,
        dueDate: undefined,
        deliveryDate: undefined,
        currency: defaultCurrency,
        variableSymbol: undefined,
        constantSymbol: undefined,
        specificSymbol: undefined,
        paymentMethod: undefined,
        bankIban: undefined,
        bankBic: undefined,
        notes: undefined,
        status: "Issued",
        documentType: "Invoice",
        items: [
          {
            description: description.trim(),
            unit,
            quantity,
            unitPrice,
            vatRate: isVatPayer ? vatRate : 0,
          },
        ],
      });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("issueFailed"));
        return;
      }
      setInvoice(result.data);
      setStep(3);
      toast.success(t("issued"));
      router.refresh();
    });
  }

  const steps = [
    { n: 1 as const, label: t("stepCustomer"), icon: UserRound },
    { n: 2 as const, label: t("stepDocument"), icon: FileText },
    { n: 3 as const, label: t("stepDeliver"), icon: Check },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <ol className="flex items-center gap-2 border-b border-rule pb-4">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const active = step === s.n;
          const done = step > s.n;
          return (
            <li key={s.n} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-[4px] border text-[12px] font-medium",
                  active && "border-ink bg-ink text-primary-foreground",
                  done && "border-ring/50 bg-raised text-ink",
                  !active && !done && "border-border text-faint",
                )}
              >
                {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
              </span>
              <span
                className={cn(
                  "truncate text-[12px] font-medium tracking-wide uppercase",
                  active ? "text-ink" : "text-faint",
                )}
              >
                {s.label}
              </span>
              {i < steps.length - 1 ? (
                <span aria-hidden className="mx-1 hidden h-px flex-1 bg-rule sm:block" />
              ) : null}
            </li>
          );
        })}
      </ol>

      {step === 1 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight text-ink">
              {t("customerTitle")}
            </h2>
            <p className="mt-1 text-[14px] text-muted-foreground">
              {t("customerBody")}
            </p>
          </div>

          {customers.length === 0 ? (
            <div className="rounded-[4px] border border-dashed border-border px-4 py-8 text-center">
              <p className="text-[14px] text-muted-foreground">{t("noCustomers")}</p>
              <CreateCustomerDialog
                onCreated={(c) => {
                  setCustomers((prev) => [
                    {
                      id: c.id,
                      name: c.name,
                      ico: c.ico,
                      city: c.city,
                    },
                    ...prev,
                  ]);
                  setCustomerId(c.id);
                }}
                trigger={
                  <Button type="button" className="mt-4">
                    {t("addCustomer")}
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-rule border-y border-rule">
              {customers.map((c) => {
                const selectedRow = c.id === customerId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setCustomerId(c.id)}
                      className={cn(
                        "flex w-full items-center gap-3 py-3 text-left transition-colors",
                        selectedRow ? "bg-raised/50" : "hover:bg-raised/30",
                      )}
                    >
                      <span
                        className={cn(
                          "size-4 shrink-0 rounded-full border",
                          selectedRow
                            ? "border-ink bg-ink"
                            : "border-border",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-medium text-ink">
                          {c.name}
                        </span>
                        <span className="block text-[12px] text-muted-foreground">
                          {[c.ico ? `IČO ${c.ico}` : null, c.city]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <CreateCustomerDialog
              onCreated={(c) => {
                setCustomers((prev) => [
                  {
                    id: c.id,
                    name: c.name,
                    ico: c.ico,
                    city: c.city,
                  },
                  ...prev,
                ]);
                setCustomerId(c.id);
              }}
              trigger={
                <Button type="button" variant="outline">
                  {t("addCustomer")}
                </Button>
              }
            />
            <Button
              type="button"
              disabled={!customerId}
              onClick={() => setStep(2)}
            >
              {t("continue")}
              <ArrowRight className="size-3.5" aria-hidden />
            </Button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight text-ink">
              {t("documentTitle")}
            </h2>
            <p className="mt-1 text-[14px] text-muted-foreground">
              {t("documentBody", { customer: selected?.name ?? "—" })}
            </p>
          </div>

          {catalogItems.length > 0 ? (
            <div className="space-y-1.5">
              <Label htmlFor="catalog">{t("fromCatalog")}</Label>
              <select
                id="catalog"
                className="flex h-9 w-full rounded-[4px] border border-border bg-surface px-3 text-[13px]"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) applyCatalog(e.target.value);
                }}
              >
                <option value="">{t("catalogPlaceholder")}</option>
                {catalogItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.description} ·{" "}
                    {formatMoney(item.unitPrice, defaultCurrency, locale)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="desc">{t("description")}</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qty">{t("quantity")}</Label>
              <Input
                id="qty"
                type="number"
                min={0.01}
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">{t("unit")}</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">{t("unitPrice")}</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="any"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
              />
            </div>
            {isVatPayer ? (
              <div className="space-y-1.5">
                <Label htmlFor="vat">{t("vat")}</Label>
                <Input
                  id="vat"
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value) || 0)}
                />
              </div>
            ) : null}
          </div>

          <p className="data-num text-[15px] font-medium text-ink">
            {t("total")}: {formatMoney(lineTotal, defaultCurrency, locale)}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="size-3.5" aria-hidden />
              {t("back")}
            </Button>
            <Button
              type="button"
              disabled={pending || !description.trim() || quantity <= 0}
              onClick={issue}
            >
              {pending ? t("issuing") : t("issue")}
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 && invoice ? (
        <section className="space-y-5">
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] text-faint uppercase">
              {t("doneEyebrow")}
            </p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-tight text-ink">
              {t("doneTitle", { number: invoice.number })}
            </h2>
            <p className="mt-2 text-[14px] text-muted-foreground">
              {t("doneBody")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href={`/api/pdf/${invoice.id}?disposition=attachment`} download>
                <Download className="size-3.5" aria-hidden />
                {t("downloadPdf")}
              </a>
            </Button>
            {invoice.customer.email ? (
              <Button asChild variant="secondary">
                <a
                  href={`mailto:${encodeURIComponent(invoice.customer.email)}?subject=${encodeURIComponent(t("mailSubject", { number: invoice.number }))}`}
                >
                  <Mail className="size-3.5" aria-hidden />
                  {t("emailCustomer")}
                </a>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href={`/invoices/${invoice.id}`}>{t("openInvoice")}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard">{t("toDashboard")}</Link>
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
