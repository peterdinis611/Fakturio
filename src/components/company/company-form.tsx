"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateCompanyAction } from "@/actions/company";
import type { CompanySettings } from "@/lib/api/types";
import type { z } from "zod";
import {
  companySchema,
  type CompanyFormValues,
} from "@/lib/validations/company";

type CompanyFormInput = z.input<typeof companySchema>;
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type CompanyFormProps = {
  initial: CompanySettings;
  mode: "onboarding" | "settings";
};

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
  return <p className="text-xs text-destructive">{message}</p>;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 border-b border-border py-8 first:pt-0 last:border-0 last:pb-0 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:gap-8">
      <div>
        <h2 className="text-[16px] font-medium text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-[14px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="panel-soft flex flex-col gap-4">{children}</div>
    </div>
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
      if (!result.ok) {
        toast.error(result.message);
        applyFieldErrors(result.fieldErrors);
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

  const fieldClass = "flex flex-col gap-1.5";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <Section title="Identita"><div className="grid gap-4 sm:grid-cols-2">
          <div className={cn(fieldClass, "sm:col-span-2")}>
            <Label htmlFor="name">Názov firmy</Label>
            <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
            <FieldError message={errors.name?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="legalForm">Právna forma</Label>
            <Input id="legalForm" {...register("legalForm")} />
            <FieldError message={errors.legalForm?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="ico">IČO</Label>
            <Input id="ico" className="data-num" {...register("ico")} />
            <FieldError message={errors.ico?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="dic">DIČ</Label>
            <Input id="dic" className="data-num" {...register("dic")} />
            <FieldError message={errors.dic?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="icDph">IČ DPH</Label>
            <Input id="icDph" {...register("icDph")} />
            <FieldError message={errors.icDph?.message} />
          </div>
          <div className={cn(fieldClass, "sm:col-span-2")}>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isVatPayer"
                checked={isVatPayer}
                onCheckedChange={(checked) =>
                  setValue("isVatPayer", checked === true)
                }
              />
              <Label htmlFor="isVatPayer" className="font-normal">
                Platca DPH
              </Label>
            </div>
            <FieldError message={errors.isVatPayer?.message} />
          </div>
          <div className={cn(fieldClass, "sm:col-span-2")}>
            <Label htmlFor="commercialRegister">Obchodný register</Label>
            <Input id="commercialRegister" {...register("commercialRegister")} />
            <FieldError message={errors.commercialRegister?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="invoiceEmail">E-mail na faktúry</Label>
            <Input id="invoiceEmail" type="email" {...register("invoiceEmail")} />
            <FieldError message={errors.invoiceEmail?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="phone">Telefón</Label>
            <Input id="phone" type="tel" {...register("phone")} />
            <FieldError message={errors.phone?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="website">Web</Label>
            <Input id="website" type="url" {...register("website")} />
            <FieldError message={errors.website?.message} />
          </div>
          <div className={cn(fieldClass, "sm:col-span-2")}>
            <Label htmlFor="contactPerson">Kontaktná osoba</Label>
            <Input id="contactPerson" {...register("contactPerson")} />
            <FieldError message={errors.contactPerson?.message} />
          </div>
        </div></Section>

      <Section title="Adresa"><div className="grid gap-4 sm:grid-cols-2">
          <div className={cn(fieldClass, "sm:col-span-2")}>
            <Label htmlFor="street">Ulica</Label>
            <Input id="street" {...register("street")} />
            <FieldError message={errors.street?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="city">Mesto</Label>
            <Input id="city" {...register("city")} />
            <FieldError message={errors.city?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="postalCode">PSČ</Label>
            <Input id="postalCode" className="data-num" {...register("postalCode")} />
            <FieldError message={errors.postalCode?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="country">Krajina</Label>
            <Input id="country" {...register("country")} />
            <FieldError message={errors.country?.message} />
          </div>
        </div></Section>

      <Section title="Banka"><div className="grid gap-4 sm:grid-cols-2">
          <div className={cn(fieldClass, "sm:col-span-2")}>
            <Label htmlFor="bankIban">IBAN</Label>
            <Input id="bankIban" className="data-num text-sm" {...register("bankIban")} />
            <FieldError message={errors.bankIban?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="bankBic">BIC / SWIFT</Label>
            <Input id="bankBic" className="data-num text-sm" {...register("bankBic")} />
            <FieldError message={errors.bankBic?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="bankName">Názov banky</Label>
            <Input id="bankName" {...register("bankName")} />
            <FieldError message={errors.bankName?.message} />
          </div>
        </div></Section>

      <Section title="Predvolené hodnoty"><div className="grid gap-4 sm:grid-cols-2">
          <div className={fieldClass}>
            <Label htmlFor="defaultDueDays">Splatnosť (dni)</Label>
            <Input
              id="defaultDueDays"
              type="number"
              min={0}
              max={365}
              className="data-num"
              {...register("defaultDueDays")}
            />
            <FieldError message={errors.defaultDueDays?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="defaultVatRate">DPH (%)</Label>
            <Input
              id="defaultVatRate"
              type="number"
              min={0}
              max={100}
              step="0.01"
              className="data-num"
              {...register("defaultVatRate")}
            />
            <FieldError message={errors.defaultVatRate?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="defaultCurrency">Mena</Label>
            <Input id="defaultCurrency" maxLength={3} className="data-num uppercase" {...register("defaultCurrency")} />
            <FieldError message={errors.defaultCurrency?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="invoicePrefix">Prefix faktúr</Label>
            <Input id="invoicePrefix" {...register("invoicePrefix")} />
            <FieldError message={errors.invoicePrefix?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="defaultPaymentMethod">Spôsob platby</Label>
            <Input id="defaultPaymentMethod" {...register("defaultPaymentMethod")} />
            <FieldError message={errors.defaultPaymentMethod?.message} />
          </div>
          <div className={fieldClass}>
            <Label htmlFor="defaultConstantSymbol">Konštantný symbol</Label>
            <Input id="defaultConstantSymbol" className="data-num" {...register("defaultConstantSymbol")} />
            <FieldError message={errors.defaultConstantSymbol?.message} />
          </div>
          <div className={cn(fieldClass, "sm:col-span-2")}>
            <Label htmlFor="defaultInvoiceNotes">Predvolená poznámka na faktúre</Label>
            <Textarea id="defaultInvoiceNotes" rows={3} {...register("defaultInvoiceNotes")} />
            <FieldError message={errors.defaultInvoiceNotes?.message} />
          </div>
          <div className={cn(fieldClass, "sm:col-span-2")}>
            <Label htmlFor="invoiceFooter">Pätička faktúry</Label>
            <Textarea id="invoiceFooter" rows={3} {...register("invoiceFooter")} />
            <FieldError message={errors.invoiceFooter?.message} />
          </div>
          <div className={cn(fieldClass, "sm:col-span-2")}>
            <Label htmlFor="notes">Interné poznámky</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
            <FieldError message={errors.notes?.message} />
          </div>
        </div></Section>

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={pending}>
          {mode === "onboarding" ? "Dokončiť onboarding" : "Uložiť firmu"}
        </Button>
      </div>
    </form>
  );
}
