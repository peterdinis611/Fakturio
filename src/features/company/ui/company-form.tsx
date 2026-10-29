"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/shared/toast";
import { updateCompanyAction } from "@/features/company/api/company";
import { actionErrorMessage, toFieldErrors } from "@/shared/lib/action-utils";
import type { CompanySettings } from "@/shared/api/types";
import type { z } from "zod";
import {
  companySchema,
  type CompanyFormValues,
} from "@/entities/company/model/schema";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { SkipOnboardingButton } from "@/features/company/ui/skip-onboarding-button";
import "./company-form.css";

type CompanyFormInput = z.input<typeof companySchema>;

type CompanyFormProps = {
  initial: CompanySettings;
  mode: "onboarding" | "settings";
};

const LEGAL_FORMS = [
  { value: "s.r.o.", label: "s.r.o." },
  { value: "SZČO", label: "SZČO" },
  { value: "a.s.", label: "a.s." },
  { value: "v.o.s.", label: "v.o.s." },
  { value: "k.s.", label: "k.s." },
  { value: "iné", label: "Iné" },
] as const;

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bankový prevod" },
  { value: "cash", label: "Hotovosť" },
  { value: "card", label: "Karta" },
  { value: "other", label: "Iné" },
] as const;

const COUNTRIES = [
  { value: "SK", label: "Slovensko" },
  { value: "CZ", label: "Česko" },
  { value: "AT", label: "Rakúsko" },
  { value: "HU", label: "Maďarsko" },
  { value: "PL", label: "Poľsko" },
  { value: "DE", label: "Nemecko" },
] as const;

const CURRENCIES = [
  { value: "EUR", label: "EUR" },
  { value: "CZK", label: "CZK" },
  { value: "USD", label: "USD" },
] as const;

function toFormValues(initial: CompanySettings): CompanyFormInput {
  return {
    name: initial.name,
    legalForm: initial.legalForm ?? "",
    ico: initial.ico ?? "",
    dic: initial.dic ?? "",
    icDph: initial.icDph ?? "",
    isVatPayer: initial.isVatPayer,
    commercialRegister: initial.commercialRegister ?? "",
    email: initial.email ?? "",
    invoiceEmail: initial.invoiceEmail ?? "",
    phone: initial.phone ?? "",
    website: initial.website ?? "",
    contactPerson: initial.contactPerson ?? "",
    street: initial.street ?? "",
    city: initial.city ?? "",
    postalCode: initial.postalCode ?? "",
    country: initial.country || "SK",
    bankIban: initial.bankIban ?? "",
    bankBic: initial.bankBic ?? "",
    bankName: initial.bankName ?? "",
    defaultDueDays: initial.defaultDueDays,
    defaultVatRate: initial.defaultVatRate,
    defaultCurrency: initial.defaultCurrency || "EUR",
    invoicePrefix: initial.invoicePrefix ?? "",
    defaultPaymentMethod: initial.defaultPaymentMethod ?? "",
    defaultConstantSymbol: initial.defaultConstantSymbol ?? "",
    defaultInvoiceNotes: initial.defaultInvoiceNotes ?? "",
    invoiceFooter: initial.invoiceFooter ?? "",
    logoUrl: initial.logoUrl ?? "",
    notes: initial.notes ?? "",
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[12px] text-negative">{message}</p>;
}

function Field({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("flex flex-col gap-1.5", className)}>{children}</div>;
}

function Section({
  index,
  title,
  hint,
  children,
  quiet,
}: {
  index: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
  quiet?: boolean;
}) {
  return (
    <Card
      size="sm"
      className={cn(
        "rounded-[6px] border-border bg-surface shadow-none",
        quiet ? "border-border/80" : "ring-1 ring-border",
      )}
    >
      <CardHeader className={cn("border-b border-rule", quiet ? "pb-2.5" : "pb-3")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle
              className={cn(
                quiet
                  ? "text-[14px] font-medium tracking-normal normal-case"
                  : "text-[13px] font-semibold tracking-[0.06em] uppercase",
              )}
            >
              {title}
            </CardTitle>
            {hint && !quiet ? (
              <CardDescription className="mt-1">{hint}</CardDescription>
            ) : null}
          </div>
          {!quiet ? (
            <Badge variant="outline" className="rounded-[4px] font-mono text-[10px]">
              {index}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className={quiet ? "pt-3.5" : "pt-4"}>
        <div className="company-section-grid">{children}</div>
      </CardContent>
    </Card>
  );
}

export function CompanyForm({ initial, mode }: CompanyFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<CompanyFormInput, unknown, CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: toFormValues(initial),
  });

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    control,
    formState: { errors },
  } = form;

  const isVatPayer = watch("isVatPayer");

  function applyFieldErrors(fieldErrors?: Record<string, string>) {
    if (!fieldErrors) return;
    for (const [key, message] of Object.entries(fieldErrors)) {
      setError(key as keyof CompanyFormValues, { message });
    }
  }

  function onSubmit(values: CompanyFormValues) {
    startTransition(async () => {
      const result = await updateCompanyAction(values);
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Uloženie zlyhalo");
        applyFieldErrors(toFieldErrors(result?.validationErrors));
        return;
      }
      toast.success(
        mode === "onboarding"
          ? "Firma bola uložená"
          : "Nastavenia firmy boli aktualizované",
      );
      if (mode === "onboarding") {
        router.push("/");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        mode === "onboarding"
          ? "company-form-sections"
          : "company-form-sections w-full",
      )}
      noValidate
    >
      <Section
        index="01"
        title="Identita"
        hint="Čo ide do hlavičky faktúry."
        quiet={mode === "settings"}
      >
        <Field className="sm:col-span-2">
          <Label htmlFor="name">Názov firmy</Label>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          <FieldError message={errors.name?.message} />
        </Field>
        <Field>
          <Label htmlFor="legalForm">Právna forma</Label>
          <Controller
            control={control}
            name="legalForm"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="legalForm"
                  className="h-9 w-full rounded-[4px] border-border bg-ground"
                >
                  <SelectValue placeholder="Vyber…" />
                </SelectTrigger>
                <SelectContent>
                  {LEGAL_FORMS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field>
          <Label htmlFor="ico">IČO</Label>
          <Input id="ico" className="data-num" {...register("ico")} />
          <FieldError message={errors.ico?.message} />
        </Field>
        <Field>
          <Label htmlFor="dic">DIČ</Label>
          <Input id="dic" className="data-num" {...register("dic")} />
        </Field>
        <Field>
          <Label htmlFor="icDph">IČ DPH</Label>
          <Input id="icDph" {...register("icDph")} />
        </Field>
        <Field className="sm:col-span-2">
          <div className="flex items-center justify-between gap-3 rounded-[4px] border border-border bg-raised/40 px-3 py-2.5">
            <div className="min-w-0">
              <Label htmlFor="isVatPayer" className="font-normal">
                Platca DPH
              </Label>
              {!isVatPayer ? (
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Na faktúrach bude DPH 0 % a text „Nie som platca DPH“.
                </p>
              ) : (
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  IČ DPH je povinné pri platcovi.
                </p>
              )}
            </div>
            <Switch
              id="isVatPayer"
              checked={isVatPayer}
              onCheckedChange={(checked) =>
                setValue("isVatPayer", checked, { shouldDirty: true })
              }
            />
          </div>
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="commercialRegister">Obchodný register</Label>
          <Input id="commercialRegister" {...register("commercialRegister")} />
        </Field>
        <Field>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...register("email")} />
        </Field>
        <Field>
          <Label htmlFor="invoiceEmail">E-mail na faktúry</Label>
          <Input id="invoiceEmail" type="email" {...register("invoiceEmail")} />
        </Field>
        <Field>
          <Label htmlFor="phone">Telefón</Label>
          <Input id="phone" type="tel" {...register("phone")} />
        </Field>
        <Field>
          <Label htmlFor="website">Web</Label>
          <Input id="website" type="url" {...register("website")} />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="contactPerson">Kontaktná osoba</Label>
          <Input id="contactPerson" {...register("contactPerson")} />
        </Field>
      </Section>

      <Section index="02" title="Adresa" quiet={mode === "settings"}>
        <Field className="sm:col-span-2">
          <Label htmlFor="street">Ulica</Label>
          <Input id="street" {...register("street")} />
        </Field>
        <Field>
          <Label htmlFor="city">Mesto</Label>
          <Input id="city" {...register("city")} />
        </Field>
        <Field>
          <Label htmlFor="postalCode">PSČ</Label>
          <Input id="postalCode" className="data-num" {...register("postalCode")} />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="country">Krajina</Label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Select value={field.value || "SK"} onValueChange={field.onChange}>
                <SelectTrigger
                  id="country"
                  className="h-9 w-full rounded-[4px] border-border bg-ground"
                >
                  <SelectValue placeholder="Krajina" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </Section>

      <Section
        index="03"
        title="Banka"
        hint="Predvolený účet na faktúrach."
        quiet={mode === "settings"}
      >
        <Field className="sm:col-span-2">
          <Label htmlFor="bankIban">IBAN</Label>
          <Input id="bankIban" className="data-num" {...register("bankIban")} />
        </Field>
        <Field>
          <Label htmlFor="bankBic">BIC / SWIFT</Label>
          <Input id="bankBic" className="data-num" {...register("bankBic")} />
        </Field>
        <Field>
          <Label htmlFor="bankName">Názov banky</Label>
          <Input id="bankName" {...register("bankName")} />
        </Field>
      </Section>

      <Section
        index="04"
        title="Predvolené hodnoty"
        hint="Použijú sa pri novej faktúre."
        quiet={mode === "settings"}
      >
        <Field>
          <Label htmlFor="defaultDueDays">Splatnosť (dni)</Label>
          <Input
            id="defaultDueDays"
            type="number"
            min={0}
            max={365}
            className="data-num"
            {...register("defaultDueDays")}
          />
        </Field>
        <Field>
          <Label htmlFor="defaultVatRate">DPH (%)</Label>
          <Input
            id="defaultVatRate"
            type="number"
            min={0}
            max={100}
            step="0.01"
            className="data-num"
            disabled={!isVatPayer}
            {...register("defaultVatRate")}
          />
        </Field>
        <Field>
          <Label htmlFor="defaultCurrency">Mena</Label>
          <Controller
            control={control}
            name="defaultCurrency"
            render={({ field }) => (
              <Select
                value={field.value || "EUR"}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="defaultCurrency"
                  className="h-9 w-full rounded-[4px] border-border bg-ground"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field>
          <Label htmlFor="invoicePrefix">Prefix faktúr</Label>
          <Input id="invoicePrefix" {...register("invoicePrefix")} />
        </Field>
        <Field>
          <Label htmlFor="defaultPaymentMethod">Spôsob platby</Label>
          <Controller
            control={control}
            name="defaultPaymentMethod"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="defaultPaymentMethod"
                  className="h-9 w-full rounded-[4px] border-border bg-ground"
                >
                  <SelectValue placeholder="Vyber…" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field>
          <Label htmlFor="defaultConstantSymbol">Konštantný symbol</Label>
          <Input
            id="defaultConstantSymbol"
            className="data-num"
            {...register("defaultConstantSymbol")}
          />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="defaultInvoiceNotes">Poznámka na faktúre</Label>
          <Textarea
            id="defaultInvoiceNotes"
            rows={3}
            {...register("defaultInvoiceNotes")}
          />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="invoiceFooter">Pätička faktúry</Label>
          <Textarea id="invoiceFooter" rows={3} {...register("invoiceFooter")} />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="notes">Interné poznámky</Label>
          <Textarea id="notes" rows={3} {...register("notes")} />
        </Field>
      </Section>

      <div
        className={
          mode === "onboarding"
            ? "company-form-footer"
            : "sticky bottom-0 -mx-1 flex items-center justify-between gap-3 border-t border-border bg-ground/95 px-1 py-4 backdrop-blur-[1px]"
        }
      >
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-[12px] text-muted-foreground">
            Zmeny sa prejavia na nových faktúrach.
          </p>
          {mode === "onboarding" ? (
            <>
              <Separator className="my-1 max-w-40 opacity-60" />
              <SkipOnboardingButton />
            </>
          ) : null}
        </div>
        <Button type="submit" disabled={pending}>
          {pending
            ? "Ukladám…"
            : mode === "onboarding"
              ? "Dokončiť"
              : "Uložiť firmu"}
        </Button>
      </div>
    </form>
  );
}
