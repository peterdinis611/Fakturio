"use client";

import { useCallback, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "@/shared/toast";
import { updateCompanyAction } from "@/features/company/api/company";
import { useRouter } from "@/i18n/navigation";
import { toRegistryAutofill } from "@/features/registry/lib/apply-registry";
import { AddressNormalizeButton } from "@/features/integrations/ui/address-normalize-button";
import { AdisregButton } from "@/features/integrations/ui/adisreg-button";
import { AresVrButton } from "@/features/integrations/ui/ares-vr-button";
import { FsVatButton } from "@/features/integrations/ui/fs-vat-button";
import { IbanLookupField } from "@/features/integrations/ui/iban-lookup-field";
import { IsirButton } from "@/features/integrations/ui/isir-button";
import { OrsrLookupButton } from "@/features/integrations/ui/orsr-lookup-button";
import { PostalValidateButton } from "@/features/integrations/ui/postal-validate-button";
import { RegisterUzButton } from "@/features/integrations/ui/register-uz-button";
import { IcoLookupField } from "@/features/registry/ui/ico-lookup-field";
import { ViesVerifyButton } from "@/features/registry/ui/vies-verify-button";
import { useRegistryLookup } from "@/features/registry/ui/use-registry-lookup";
import { actionErrorMessage, toFieldErrors } from "@/shared/lib/action-utils";
import type { CompanySettings, RegistryCompany } from "@/shared/api/types";
import type { z } from "zod";
import {
  companySchema,
  INVOICE_PDF_TEMPLATES,
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
import { CountrySelect } from "@/shared/ui/country-select";
import { CurrencySelect } from "@/shared/ui/currency-select";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PaymentMethodSelect } from "@/shared/ui/payment-method-select";
import { PhoneInput } from "@/shared/ui/phone-input";
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

const LEGAL_FORMS: {
  value: string;
  label?: string;
  labelKey?: "legalFormOther";
}[] = [
  { value: "s.r.o.", label: "s.r.o." },
  { value: "SZČO", label: "SZČO" },
  { value: "a.s.", label: "a.s." },
  { value: "v.o.s.", label: "v.o.s." },
  { value: "k.s.", label: "k.s." },
  { value: "iné", labelKey: "legalFormOther" },
];

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
    invoicePdfTemplate: initial.invoicePdfTemplate ?? "classic",
    logoUrl: initial.logoUrl ?? "",
    notes: initial.notes ?? "",
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[12px] text-negative">{message}</p>;
}

function RequiredMark() {
  return (
    <span className="text-negative" aria-hidden="true">
      *
    </span>
  );
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
  const t = useTranslations("Company");
  const tOnboarding = useTranslations("Onboarding");
  const tc = useTranslations("Common");
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
  const country = watch("country");
  const ico = watch("ico");
  const dic = watch("dic");
  const icDph = watch("icDph");
  const bankIban = watch("bankIban");
  const street = watch("street");
  const city = watch("city");
  const postalCode = watch("postalCode");

  const applyRegistry = useCallback(
    (data: RegistryCompany) => {
      const fields = toRegistryAutofill(data, { includeCompanyExtras: true });
      const opts = { shouldDirty: true, shouldValidate: true } as const;
      setValue("name", fields.name, opts);
      setValue("ico", fields.ico, opts);
      setValue("country", fields.country, opts);
      if (fields.street) setValue("street", fields.street, opts);
      if (fields.city) setValue("city", fields.city, opts);
      if (fields.postalCode) setValue("postalCode", fields.postalCode, opts);
      if (fields.dic) setValue("dic", fields.dic, opts);
      if (fields.icDph) setValue("icDph", fields.icDph, opts);
      if (typeof fields.isVatPayer === "boolean") {
        setValue("isVatPayer", fields.isVatPayer, opts);
        if (!fields.isVatPayer && !fields.icDph) {
          setValue("icDph", "", opts);
        }
      }
      if (fields.legalForm) setValue("legalForm", fields.legalForm, opts);
      if (fields.commercialRegister) {
        setValue("commercialRegister", fields.commercialRegister, opts);
      }
    },
    [setValue],
  );

  const { canLookup, lookingUp, registrySupported, lookup } = useRegistryLookup({
    ico,
    country,
    onFound: applyRegistry,
  });

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
        toast.error(actionErrorMessage(result ?? {}) ?? t("saveFailed"));
        applyFieldErrors(toFieldErrors(result?.validationErrors));
        return;
      }
      toast.success(t("saved"));
      router.push(mode === "onboarding" ? "/first-invoice" : "/dashboard");
      router.refresh();
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
        title={t("identity")}
        hint={t("identityHint")}
        quiet={mode === "settings"}
      >
        <Field className="sm:col-span-2">
          <Label htmlFor="name">
            {t("name")} <RequiredMark />
          </Label>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          <FieldError message={errors.name?.message} />
        </Field>
        <Field>
          <Label htmlFor="legalForm">{t("legalForm")}</Label>
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
                  <SelectValue placeholder={tc("selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {LEGAL_FORMS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.labelKey ? t(opt.labelKey) : opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field>
          <Label htmlFor="ico">
            {t("ico")} <RequiredMark />
          </Label>
          <IcoLookupField
            id="ico"
            register={register("ico")}
            lookingUp={lookingUp}
            registrySupported={registrySupported}
            canLookup={canLookup}
            onLookup={lookup}
            aria-invalid={!!errors.ico}
          />
          <FieldError message={errors.ico?.message} />
          {registrySupported ? (
            <p className="text-[11px] text-muted-foreground">
              {t("icoLookupHint", {
                source:
                  country?.toUpperCase() === "CZ" ? "ARES" : "ORSF / RPO",
              })}
            </p>
          ) : null}
        </Field>
        <Field>
          <Label htmlFor="dic">{t("dic")}</Label>
          <Input
            id="dic"
            className="data-num"
            {...register("dic")}
            aria-invalid={!!errors.dic}
          />
          <FieldError message={errors.dic?.message} />
          <p className="text-[11px] text-muted-foreground">{t("optional")}</p>
          {(country ?? "").toUpperCase() === "CZ" ? (
            <div className="pt-1">
              <AdisregButton dic={dic || ico} />
            </div>
          ) : null}
        </Field>
        <Field>
          <Label htmlFor="icDph">
            {t("icDph")} {isVatPayer ? <RequiredMark /> : null}
          </Label>
          <div className="flex flex-wrap gap-2">
            <Input
              id="icDph"
              className="min-w-0 flex-1"
              {...register("icDph")}
              aria-invalid={!!errors.icDph}
            />
            <ViesVerifyButton vat={icDph} />
            <FsVatButton
              ico={ico}
              onFound={(data) => {
                const opts = { shouldDirty: true, shouldValidate: true } as const;
                setValue("isVatPayer", data.isVatPayer, opts);
                if (data.dic) setValue("dic", data.dic, opts);
                if (data.icDph) setValue("icDph", data.icDph, opts);
              }}
            />
          </div>
          <FieldError message={errors.icDph?.message} />
          <p className="text-[11px] text-muted-foreground">
            {isVatPayer ? t("vatRequired") : t("vatOptional")}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <OrsrLookupButton ico={ico} />
            {(country ?? "").toUpperCase() === "SK" ? (
              <RegisterUzButton
                ico={ico}
                onFound={(data) => {
                  const opts = { shouldDirty: true, shouldValidate: true } as const;
                  if (data.dic) setValue("dic", data.dic, opts);
                  if (data.street) setValue("street", data.street, opts);
                  if (data.city) setValue("city", data.city, opts);
                  if (data.postalCode) setValue("postalCode", data.postalCode, opts);
                }}
              />
            ) : null}
            {(country ?? "").toUpperCase() === "CZ" ? (
              <>
                <IsirButton ico={ico} />
                <AresVrButton ico={ico} />
              </>
            ) : null}
          </div>
        </Field>
        <Field className="sm:col-span-2">
          <div className="flex items-center justify-between gap-3 rounded-[4px] border border-border bg-raised/40 px-3 py-2.5">
            <div className="min-w-0">
              <Label htmlFor="isVatPayer" className="font-normal">
                {t("vatPayer")}
              </Label>
              {!isVatPayer ? (
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {t("notVatPayer")}
                </p>
              ) : (
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {t("vatPayerRequired")}
                </p>
              )}
            </div>
            <Switch
              id="isVatPayer"
              checked={isVatPayer}
              onCheckedChange={(checked) =>
                setValue("isVatPayer", checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </div>
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="commercialRegister">{t("commercialRegister")}</Label>
          <Input id="commercialRegister" {...register("commercialRegister")} />
          <p className="text-[11px] text-muted-foreground">{t("optional")}</p>
        </Field>
        <Field>
          <Label htmlFor="email">
            {t("email")} <RequiredMark />
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          <FieldError message={errors.email?.message} />
        </Field>
        <Field>
          <Label htmlFor="invoiceEmail">{t("invoiceEmail")}</Label>
          <Input id="invoiceEmail" type="email" {...register("invoiceEmail")} />
        </Field>
        <Field>
          <Label htmlFor="phone">{t("phone")}</Label>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <PhoneInput
                id="phone"
                value={field.value ?? ""}
                onChange={field.onChange}
                countryCode={country || "SK"}
              />
            )}
          />
        </Field>
        <Field>
          <Label htmlFor="website">{t("website")}</Label>
          <Input id="website" type="url" {...register("website")} />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="contactPerson">{t("contactPerson")}</Label>
          <Input id="contactPerson" {...register("contactPerson")} />
        </Field>
      </Section>

      <Section index="02" title={t("address")} quiet={mode === "settings"}>
        <Field className="sm:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="street">
              {t("street")} <RequiredMark />
            </Label>
            <AddressNormalizeButton
              query={[street, city].filter(Boolean).join(", ")}
              country={country}
              onNormalized={(data) => {
                const opts = { shouldDirty: true, shouldValidate: true } as const;
                if (data.street) setValue("street", data.street, opts);
                if (data.city) setValue("city", data.city, opts);
                if (data.postalCode) setValue("postalCode", data.postalCode, opts);
                if (data.country) setValue("country", data.country, opts);
              }}
            />
          </div>
          <Input
            id="street"
            {...register("street")}
            aria-invalid={!!errors.street}
          />
          <FieldError message={errors.street?.message} />
        </Field>
        <Field>
          <Label htmlFor="city">
            {t("city")} <RequiredMark />
          </Label>
          <Input id="city" {...register("city")} aria-invalid={!!errors.city} />
          <FieldError message={errors.city?.message} />
        </Field>
        <Field>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="postalCode">
              {t("postalCode")} <RequiredMark />
            </Label>
            <PostalValidateButton
              code={postalCode}
              country={country}
              city={city}
              onValidated={(data) => {
                const opts = { shouldDirty: true, shouldValidate: true } as const;
                if (data.postalCode) setValue("postalCode", data.postalCode, opts);
                if (data.city) setValue("city", data.city, opts);
              }}
            />
          </div>
          <Input
            id="postalCode"
            className="data-num"
            {...register("postalCode")}
            aria-invalid={!!errors.postalCode}
          />
          <FieldError message={errors.postalCode?.message} />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="country">
            {t("country")} <RequiredMark />
          </Label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <CountrySelect
                id="country"
                value={field.value || "SK"}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
      </Section>

      <Section
        index="03"
        title={t("bank")}
        hint={t("bankHint")}
        quiet={mode === "settings"}
      >
        <Field className="sm:col-span-2">
          <Label htmlFor="bankIban">
            {t("iban")} <RequiredMark />
          </Label>
          <IbanLookupField
            id="bankIban"
            register={register("bankIban")}
            value={bankIban ?? ""}
            aria-invalid={!!errors.bankIban}
            onResolved={(data) => {
              const opts = { shouldDirty: true, shouldValidate: true } as const;
              setValue("bankIban", data.iban, opts);
              if (data.bankName) setValue("bankName", data.bankName, opts);
              if (data.bic) setValue("bankBic", data.bic, opts);
            }}
          />
          <FieldError message={errors.bankIban?.message} />
        </Field>
        <Field>
          <Label htmlFor="bankBic">{t("bic")}</Label>
          <Input id="bankBic" className="data-num" {...register("bankBic")} />
        </Field>
        <Field>
          <Label htmlFor="bankName">{t("bankName")}</Label>
          <Input id="bankName" {...register("bankName")} />
        </Field>
      </Section>

      <Section
        index="04"
        title={t("defaultsTitle")}
        hint={t("defaultsHint")}
        quiet={mode === "settings"}
      >
        <Field>
          <Label htmlFor="defaultDueDays">{t("defaultDueDays")}</Label>
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
          <Label htmlFor="defaultVatRate">{t("defaultVatShort")}</Label>
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
          <Label htmlFor="defaultCurrency">{t("currency")}</Label>
          <Controller
            control={control}
            name="defaultCurrency"
            render={({ field }) => (
              <CurrencySelect
                id="defaultCurrency"
                value={field.value || "EUR"}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
        <Field>
          <Label htmlFor="invoicePrefix">{t("invoicePrefix")}</Label>
          <Input id="invoicePrefix" {...register("invoicePrefix")} />
        </Field>
        <Field>
          <Label htmlFor="defaultPaymentMethod">{t("paymentMethod")}</Label>
          <Controller
            control={control}
            name="defaultPaymentMethod"
            render={({ field }) => (
              <PaymentMethodSelect
                id="defaultPaymentMethod"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
        <Field>
          <Label htmlFor="defaultConstantSymbol">{t("constantSymbol")}</Label>
          <Input
            id="defaultConstantSymbol"
            className="data-num"
            {...register("defaultConstantSymbol")}
          />
        </Field>
        <Field className="sm:col-span-2">
          <Label>{t("pdfTemplate")}</Label>
          <p className="mb-2 text-[12px] text-muted-foreground">
            {t("pdfTemplateHint")}
          </p>
          <Controller
            control={control}
            name="invoicePdfTemplate"
            render={({ field }) => (
              <div className="grid gap-2 sm:grid-cols-3">
                {INVOICE_PDF_TEMPLATES.map((tpl) => {
                  const selected = field.value === tpl.value;
                  return (
                    <button
                      key={tpl.value}
                      type="button"
                      onClick={() => field.onChange(tpl.value)}
                      className={cn(
                        "rounded-[6px] border px-3 py-3 text-left transition-colors",
                        selected
                          ? "border-ink bg-raised ring-1 ring-ink"
                          : "border-rule bg-surface hover:border-ink/40",
                      )}
                    >
                      <span className="block text-[13px] font-medium text-ink">
                        {t(tpl.labelKey)}
                      </span>
                      <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                        {t(tpl.bodyKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="defaultInvoiceNotes">{t("defaultInvoiceNotes")}</Label>
          <Textarea
            id="defaultInvoiceNotes"
            rows={3}
            {...register("defaultInvoiceNotes")}
          />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="invoiceFooter">{t("invoiceFooter")}</Label>
          <Textarea id="invoiceFooter" rows={3} {...register("invoiceFooter")} />
        </Field>
        <Field className="sm:col-span-2">
          <Label htmlFor="notes">{t("notes")}</Label>
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
            {t("footerNote")}
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
            ? `${t("save")}…`
            : mode === "onboarding"
              ? tOnboarding("done")
              : t("save")}
        </Button>
      </div>
    </form>
  );
}
