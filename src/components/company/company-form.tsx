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
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type CompanyFormInput = z.input<typeof companySchema>;

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
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-rule py-7 last:border-0">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {hint ? (
          <p className="mt-0.5 text-[13px] text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-[40rem]"
      noValidate
    >
      <Section title="Identita" hint="Čo ide do hlavičky faktúry.">
        <Field className="sm:col-span-2">
          <Label htmlFor="name">Názov firmy</Label>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          <FieldError message={errors.name?.message} />
        </Field>
        <Field>
          <Label htmlFor="legalForm">Právna forma</Label>
          <Input id="legalForm" placeholder="s.r.o., SZČO…" {...register("legalForm")} />
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
          <div className="flex items-center gap-2.5 rounded-[4px] border border-border bg-surface px-3 py-2.5">
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

      <Section title="Adresa">
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
        <Field>
          <Label htmlFor="country">Krajina</Label>
          <Input id="country" {...register("country")} />
        </Field>
      </Section>

      <Section title="Banka" hint="Predvolený účet na faktúrach.">
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

      <Section title="Predvolené hodnoty" hint="Použijú sa pri novej faktúre.">
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
            {...register("defaultVatRate")}
          />
        </Field>
        <Field>
          <Label htmlFor="defaultCurrency">Mena</Label>
          <Input
            id="defaultCurrency"
            maxLength={3}
            className="data-num uppercase"
            {...register("defaultCurrency")}
          />
        </Field>
        <Field>
          <Label htmlFor="invoicePrefix">Prefix faktúr</Label>
          <Input id="invoicePrefix" {...register("invoicePrefix")} />
        </Field>
        <Field>
          <Label htmlFor="defaultPaymentMethod">Spôsob platby</Label>
          <Input
            id="defaultPaymentMethod"
            placeholder="bank_transfer"
            {...register("defaultPaymentMethod")}
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

      <div className="sticky bottom-0 -mx-1 flex items-center justify-between gap-3 border-t border-border bg-ground/95 px-1 py-4 backdrop-blur-[1px]">
        <p className="text-[12px] text-muted-foreground">
          Zmeny sa prejavia na nových faktúrach.
        </p>
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
