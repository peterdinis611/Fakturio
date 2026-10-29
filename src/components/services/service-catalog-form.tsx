"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import {
  createServiceAction,
  updateServiceAction,
} from "@/actions/services";
import type { ServiceCatalogItem } from "@/lib/api/types";
import { actionErrorMessage, toFieldErrors } from "@/lib/action-utils";
import {
  serviceCatalogSchema,
  type ServiceCatalogFormInput,
  type ServiceCatalogFormValues,
} from "@/lib/validations/service-catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  initial?: ServiceCatalogItem | null;
  isVatPayer: boolean;
  defaultVatRate: number;
  onDone?: () => void;
};

export function ServiceCatalogForm({
  initial,
  isVatPayer,
  defaultVatRate,
  onDone,
}: Props) {
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initial?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ServiceCatalogFormInput, unknown, ServiceCatalogFormValues>({
    resolver: zodResolver(serviceCatalogSchema),
    defaultValues: {
      description: initial?.description ?? "",
      unit: initial?.unit ?? "ks",
      unitPrice: initial?.unitPrice ?? 0,
      vatRate: isVatPayer
        ? (initial?.vatRate ?? defaultVatRate)
        : 0,
      isActive: initial?.isActive ?? true,
      sortOrder: initial?.sortOrder ?? 0,
    },
  });

  const isActive = watch("isActive");

  function submit(values: ServiceCatalogFormValues) {
    startTransition(async () => {
      const payload = {
        ...values,
        vatRate: isVatPayer ? values.vatRate : 0,
      };
      const result = isEdit
        ? await updateServiceAction({ ...payload, id: initial!.id })
        : await createServiceAction(payload);

      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Uloženie zlyhalo");
        const fieldErrors = toFieldErrors(result?.validationErrors);
        if (fieldErrors) {
          for (const [key, message] of Object.entries(fieldErrors)) {
            setError(key as keyof ServiceCatalogFormValues, { message });
          }
        }
        return;
      }

      toast.success(isEdit ? "Služba upravená" : "Služba pridaná");
      onDone?.();
    });
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Popis</Label>
        <Input id="description" disabled={pending} {...register("description")} />
        {errors.description ? (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="unit">Jednotka</Label>
          <Input id="unit" disabled={pending} {...register("unit")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="unitPrice">Cena</Label>
          <Input
            id="unitPrice"
            type="number"
            min={0}
            step="0.01"
            className="data-num"
            disabled={pending}
            {...register("unitPrice")}
          />
        </div>
        {isVatPayer ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vatRate">DPH %</Label>
            <Input
              id="vatRate"
              type="number"
              min={0}
              max={100}
              className="data-num"
              disabled={pending}
              {...register("vatRate")}
            />
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2.5">
        <Checkbox
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) =>
            setValue("isActive", checked === true)
          }
        />
        <Label htmlFor="isActive" className="font-normal">
          Aktívna
        </Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {isEdit ? "Uložiť" : "Pridať"}
        </Button>
      </div>
    </form>
  );
}
