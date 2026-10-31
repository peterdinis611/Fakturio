"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/shared/toast";
import type { z } from "zod";
import {
  createCustomerAction,
  updateCustomerAction,
} from "@/features/customers/api/customers";
import { toRegistryAutofill } from "@/features/registry/lib/apply-registry";
import { IcoLookupField } from "@/features/registry/ui/ico-lookup-field";
import { useRegistryLookup } from "@/features/registry/ui/use-registry-lookup";
import type { Customer, RegistryCompany } from "@/shared/api/types";
import { actionErrorMessage, toFieldErrors } from "@/shared/lib/action-utils";
import {
  customerSchema,
  type CustomerFormValues,
} from "@/entities/customer/model/schema";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { CountrySelect } from "@/shared/ui/country-select";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PhoneInput } from "@/shared/ui/phone-input";

type CustomerFormInput = z.input<typeof customerSchema>;

type CustomerFormProps = {
  initial?: Customer | null;
  customerId?: string;
  /** Compact layout for dialogs (no outer panel). */
  embedded?: boolean;
  /** When set, skips default navigation after create/update. */
  onSuccess?: (customer: Customer) => void;
};

function toFormValues(initial?: Customer | null): CustomerFormInput {
  return {
    name: initial?.name ?? "",
    ico: initial?.ico ?? "",
    dic: initial?.dic ?? "",
    icDph: initial?.icDph ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    street: initial?.street ?? "",
    city: initial?.city ?? "",
    postalCode: initial?.postalCode ?? "",
    country: initial?.country ?? "SK",
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function CustomerForm({
  initial,
  customerId,
  embedded = false,
  onSuccess,
}: CustomerFormProps) {
  const t = useTranslations("CustomerDetail");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(customerId);

  const form = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: toFormValues(initial),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = form;

  const country = watch("country");
  const ico = watch("ico");

  const applyRegistry = useCallback(
    (data: RegistryCompany) => {
      const fields = toRegistryAutofill(data);
      const opts = { shouldDirty: true, shouldValidate: true } as const;
      setValue("name", fields.name, opts);
      setValue("ico", fields.ico, opts);
      setValue("country", fields.country, opts);
      if (fields.street) setValue("street", fields.street, opts);
      if (fields.city) setValue("city", fields.city, opts);
      if (fields.postalCode) setValue("postalCode", fields.postalCode, opts);
      if (fields.dic) setValue("dic", fields.dic, opts);
      if (fields.icDph) setValue("icDph", fields.icDph, opts);
    },
    [setValue],
  );

  const { canLookup, lookingUp, registrySupported, lookup } = useRegistryLookup({
    ico,
    country,
    onFound: applyRegistry,
    messages: {
      needIco: t("lookupNeedIco"),
      filledRpo: t("lookupFilledRpo"),
      filledAres: t("lookupFilledAres"),
    },
  });

  function applyFieldErrors(fieldErrors?: Record<string, string>) {
    if (!fieldErrors) return;
    for (const [key, message] of Object.entries(fieldErrors)) {
      setError(key as keyof CustomerFormValues, { message });
    }
  }

  function onSubmit(values: CustomerFormValues) {
    startTransition(async () => {
      const result = isEdit
        ? await updateCustomerAction({ ...values, id: customerId! })
        : await createCustomerAction(values);

      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Operácia zlyhala");
        applyFieldErrors(toFieldErrors(result?.validationErrors));
        return;
      }

      toast.success(isEdit ? t("updated") : t("created"));

      if (onSuccess) {
        onSuccess(result.data);
        return;
      }

      router.push(`/customers/${result.data.id}`);
      router.refresh();
    });
  }

  const fieldClass = "flex flex-col gap-1.5";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "flex flex-col gap-4",
        !embedded && "panel p-4",
      )}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={cn(fieldClass, "sm:col-span-2")}>
          <Label htmlFor="customer-name">{t("name")}</Label>
          <Input
            id="customer-name"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div className={fieldClass}>
          <Label htmlFor="customer-ico">IČO</Label>
          <IcoLookupField
            id="customer-ico"
            register={register("ico")}
            lookingUp={lookingUp}
            registrySupported={registrySupported}
            canLookup={canLookup}
            onLookup={lookup}
            aria-invalid={!!errors.ico}
          />
          <FieldError message={errors.ico?.message} />
          {registrySupported ? (
            <p className="text-[11px] text-muted-foreground">{t("icoHint")}</p>
          ) : null}
        </div>
        <div className={fieldClass}>
          <Label htmlFor="customer-dic">DIČ</Label>
          <Input id="customer-dic" className="data-num" {...register("dic")} />
          <FieldError message={errors.dic?.message} />
        </div>
        <div className={fieldClass}>
          <Label htmlFor="customer-icDph">IČ DPH</Label>
          <Input id="customer-icDph" {...register("icDph")} />
          <FieldError message={errors.icDph?.message} />
        </div>
        <div className={fieldClass}>
          <Label htmlFor="customer-email">E-mail</Label>
          <Input id="customer-email" type="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div className={fieldClass}>
          <Label htmlFor="customer-phone">Telefón</Label>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <PhoneInput
                id="customer-phone"
                value={field.value ?? ""}
                onChange={field.onChange}
                countryCode={country || "SK"}
              />
            )}
          />
          <FieldError message={errors.phone?.message} />
        </div>
        <div className={cn(fieldClass, "sm:col-span-2")}>
          <Label htmlFor="customer-street">Ulica</Label>
          <Input id="customer-street" {...register("street")} />
          <FieldError message={errors.street?.message} />
        </div>
        <div className={fieldClass}>
          <Label htmlFor="customer-city">Mesto</Label>
          <Input id="customer-city" {...register("city")} />
          <FieldError message={errors.city?.message} />
        </div>
        <div className={fieldClass}>
          <Label htmlFor="customer-postalCode">PSČ</Label>
          <Input
            id="customer-postalCode"
            className="data-num"
            {...register("postalCode")}
          />
          <FieldError message={errors.postalCode?.message} />
        </div>
        <div className={fieldClass}>
          <Label htmlFor="customer-country">Krajina</Label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <CountrySelect
                id="customer-country"
                value={field.value || "SK"}
                onChange={field.onChange}
              />
            )}
          />
          <FieldError message={errors.country?.message} />
        </div>
      </div>

      <div
        className={cn(
          "flex justify-end",
          !embedded && "border-t border-border pt-4",
        )}
      >
        <Button type="submit" disabled={pending}>
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
