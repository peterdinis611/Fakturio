"use client";

import { useTransition, type ComponentProps } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/shared/toast";
import { updateJobSettingsAction } from "@/features/settings/api/jobs";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import type { JobSettings } from "@/shared/api/types";
import {
  jobSettingsSchema,
  type JobSettingsFormInput,
  type JobSettingsFormValues,
} from "@/features/settings/model/jobs-schema";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Spinner } from "@/shared/ui/spinner";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function NumberField({
  id,
  label,
  hint,
  disabled,
  error,
  ...reg
}: {
  id: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  error?: string;
} & ComponentProps<"input">) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        className="data-num h-9 max-w-[8rem]"
        disabled={disabled}
        {...reg}
      />
      {hint ? <p className="text-[12px] text-faint">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  );
}

function BoolField({
  id,
  label,
  hint,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-[4px] border border-transparent py-1.5 hover:border-rule"
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="mt-0.5"
      />
      <span>
        <span className="block text-[14px] font-medium text-ink">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[12px] text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function JobsForm({ initial }: { initial: JobSettings }) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<JobSettingsFormInput, unknown, JobSettingsFormValues>({
    resolver: zodResolver(jobSettingsSchema),
    defaultValues: initial,
  });

  function onSubmit(values: JobSettingsFormValues) {
    startTransition(async () => {
      const result = await updateJobSettingsAction(values);
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Uloženie zlyhalo");
        return;
      }
      toast.success("Automatizácia uložená");
    });
  }

  return (
    <form
      className="max-w-2xl space-y-8"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <section className="space-y-4 border-t border-rule pt-5">
        <div>
          <h2 className="text-[15px] font-medium text-ink">
            Faktúry po splatnosti
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Raz denne označí vystavené faktúry, ktorým už uplynul termín
            splatnosti.
          </p>
        </div>

        <Controller
          control={control}
          name="overdueSync.enabled"
          render={({ field }) => (
            <BoolField
              id="overdue-enabled"
              label="Zapnúť kontrolu"
              checked={field.value}
              disabled={pending}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="overdueSync.runOnStartup"
          render={({ field }) => (
            <BoolField
              id="overdue-startup"
              label="Skontrolovať aj pri zapnutí"
              hint="Jednorazovo po štarte, potom podľa denného času nižšie."
              checked={field.value}
              disabled={pending}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            id="overdue-hour"
            label="Hodina"
            hint="UTC"
            disabled={pending}
            error={errors.overdueSync?.runAtHourUtc?.message}
            {...register("overdueSync.runAtHourUtc")}
          />
          <NumberField
            id="overdue-minute"
            label="Minúta"
            hint="UTC"
            disabled={pending}
            error={errors.overdueSync?.runAtMinuteUtc?.message}
            {...register("overdueSync.runAtMinuteUtc")}
          />
          <NumberField
            id="overdue-delay"
            label="Oneskorenie (s)"
            hint="Po zapnutí aplikácie"
            disabled={pending}
            error={errors.overdueSync?.startupDelaySeconds?.message}
            {...register("overdueSync.startupDelaySeconds")}
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-rule pt-5">
        <div>
          <h2 className="text-[15px] font-medium text-ink">Upomienky</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Denne pripraví zoznam faktúr na upomienku. E-mail zatiaľ neposiela —
            zapisovanie odoslania zapni až keď budeš mať notifikácie.
          </p>
        </div>

        <Controller
          control={control}
          name="reminderJob.enabled"
          render={({ field }) => (
            <BoolField
              id="reminder-enabled"
              label="Zapnúť prípravu upomienok"
              checked={field.value}
              disabled={pending}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="reminderJob.runOnStartup"
          render={({ field }) => (
            <BoolField
              id="reminder-startup"
              label="Skontrolovať aj pri zapnutí"
              checked={field.value}
              disabled={pending}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="reminderJob.onlyOverdue"
          render={({ field }) => (
            <BoolField
              id="reminder-only-overdue"
              label="Len faktúry po splatnosti"
              hint="Preskočí faktúry, ktorým termín ešte neuplynul."
              checked={field.value}
              disabled={pending}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="reminderJob.markAsSent"
          render={({ field }) => (
            <BoolField
              id="reminder-mark"
              label="Zapísať odoslanie upomienky"
              hint="Označí faktúru, že upomienka už prebehla (dátum a počet)."
              checked={field.value}
              disabled={pending}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            id="reminder-hour"
            label="Hodina"
            hint="UTC"
            disabled={pending}
            error={errors.reminderJob?.runAtHourUtc?.message}
            {...register("reminderJob.runAtHourUtc")}
          />
          <NumberField
            id="reminder-minute"
            label="Minúta"
            hint="UTC"
            disabled={pending}
            error={errors.reminderJob?.runAtMinuteUtc?.message}
            {...register("reminderJob.runAtMinuteUtc")}
          />
          <NumberField
            id="reminder-within"
            label="Dni dopredu"
            hint="Koľko dní pred/po splatnosti hľadať (0–90)."
            disabled={pending}
            error={errors.reminderJob?.withinDays?.message}
            {...register("reminderJob.withinDays")}
          />
          <NumberField
            id="reminder-cooldown"
            label="Min. dní medzi"
            hint="Koľko dní počkať pred ďalšou upomienkou."
            disabled={pending}
            error={errors.reminderJob?.minDaysBetweenReminders?.message}
            {...register("reminderJob.minDaysBetweenReminders")}
          />
          <NumberField
            id="reminder-delay"
            label="Oneskorenie (s)"
            hint="Po zapnutí aplikácie"
            disabled={pending}
            error={errors.reminderJob?.startupDelaySeconds?.message}
            {...register("reminderJob.startupDelaySeconds")}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-4">
        <Button type="submit" disabled={pending || !isDirty}>
          {pending ? (
            <>
              <Spinner size="sm" label="Ukladám" />
              Ukladám…
            </>
          ) : (
            "Uložiť"
          )}
        </Button>
        <p className="text-[12px] text-faint">
          Zmeny platia od nasledujúceho denného behu — reštart nie je potrebný.
        </p>
      </div>
    </form>
  );
}
