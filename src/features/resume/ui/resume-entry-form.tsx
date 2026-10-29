"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/shared/toast";
import {
  createResumeEntryAction,
  updateResumeEntryAction,
} from "@/features/resume/api/resume";
import type { ResumeEntry } from "@/shared/api/types";
import { actionErrorMessage, toFieldErrors } from "@/shared/lib/action-utils";
import {
  resumeEntrySchema,
  resumeEntryTypeLabels,
  resumeEntryTypes,
  type ResumeEntryFormInput,
  type ResumeEntryFormValues,
} from "@/entities/resume/model/schema";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { DatePicker } from "@/shared/ui/date-picker";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

type Props = {
  initial?: ResumeEntry | null;
  onDone?: () => void;
};

export function ResumeEntryForm({ initial, onDone }: Props) {
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initial?.id);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ResumeEntryFormInput, unknown, ResumeEntryFormValues>({
    resolver: zodResolver(resumeEntrySchema),
    defaultValues: {
      type: initial?.type ?? "experience",
      title: initial?.title ?? "",
      organization: initial?.organization ?? "",
      location: initial?.location ?? "",
      startDate: initial?.startDate ?? "",
      endDate: initial?.endDate ?? "",
      isCurrent: initial?.isCurrent ?? false,
      description: initial?.description ?? "",
      sortOrder: initial?.sortOrder ?? 0,
    },
  });

  const isCurrent = watch("isCurrent");

  function submit(values: ResumeEntryFormValues) {
    startTransition(async () => {
      const result = isEdit
        ? await updateResumeEntryAction({ ...values, id: initial!.id })
        : await createResumeEntryAction(values);

      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Uloženie zlyhalo");
        const fieldErrors = toFieldErrors(result?.validationErrors);
        if (fieldErrors) {
          for (const [key, message] of Object.entries(fieldErrors)) {
            setError(key as keyof ResumeEntryFormValues, { message });
          }
        }
        return;
      }

      toast.success(isEdit ? "Položka upravená" : "Položka pridaná");
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
        <Label>Typ</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={pending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Vyber typ" />
              </SelectTrigger>
              <SelectContent>
                {resumeEntryTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {resumeEntryTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Názov / pozícia</Label>
        <Input id="title" disabled={pending} {...register("title")} />
        {errors.title ? (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="organization">Organizácia</Label>
          <Input
            id="organization"
            disabled={pending}
            {...register("organization")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Lokalita</Label>
          <Input id="location" disabled={pending} {...register("location")} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">Od</Label>
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <DatePicker
                id="startDate"
                value={field.value}
                disabled={pending}
                placeholder="Začiatok"
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate">Do</Label>
          <Controller
            control={control}
            name="endDate"
            render={({ field }) => (
              <DatePicker
                id="endDate"
                value={field.value}
                disabled={pending || isCurrent}
                placeholder="Koniec"
                fromDate={watch("startDate") || undefined}
                onChange={field.onChange}
              />
            )}
          />
          {errors.endDate ? (
            <p className="text-xs text-destructive">{errors.endDate.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="isCurrent"
          checked={isCurrent}
          onCheckedChange={(checked) => {
            const next = checked === true;
            setValue("isCurrent", next);
            if (next) setValue("endDate", "");
          }}
        />
        <Label htmlFor="isCurrent" className="font-normal">
          Prebieha / aktuálne
        </Label>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Popis</Label>
        <Textarea
          id="description"
          rows={3}
          disabled={pending}
          {...register("description")}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {isEdit ? "Uložiť" : "Pridať"}
        </Button>
      </div>
    </form>
  );
}
