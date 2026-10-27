"use client";

import { useTransition, type ComponentProps } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateJobSettingsAction } from "@/actions/jobs";
import { actionErrorMessage } from "@/lib/action-utils";
import type { JobSettings } from "@/lib/api/types";
import {
  jobSettingsSchema,
  type JobSettingsFormInput,
  type JobSettingsFormValues,
} from "@/lib/validations/jobs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

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
      toast.success("Nastavenia jobov uložené");
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
          <h2 className="text-[15px] font-medium text-ink">Overdue sync</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Denne prepne vystavené faktúry po splatnosti na stav Overdue.
          </p>
        </div>

        <Controller
          control={control}
          name="overdueSync.enabled"
          render={({ field }) => (
            <BoolField
              id="overdue-enabled"
              label="Zapnuté"
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
              label="Spustiť po štarte API"
              hint="Jednorazovo ~po štarte, potom podľa denného plánu."
              checked={field.value}
              disabled={pending}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            id="overdue-hour"
            label="Hodina (UTC)"
            disabled={pending}
            error={errors.overdueSync?.runAtHourUtc?.message}
            {...register("overdueSync.runAtHourUtc")}
          />
          <NumberField
            id="overdue-minute"
            label="Minúta (UTC)"
            disabled={pending}
            error={errors.overdueSync?.runAtMinuteUtc?.message}
            {...register("overdueSync.runAtMinuteUtc")}
          />
          <NumberField
            id="overdue-delay"
            label="Startup delay (s)"
            disabled={pending}
            error={errors.overdueSync?.startupDelaySeconds?.message}
            {...register("overdueSync.startupDelaySeconds")}
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-rule pt-5">
        <div>
          <h2 className="text-[15px] font-medium text-ink">Reminder job</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Denne nájde kandidátov na upomienku. Bez e-mailu zatiaľ len loguje —
            <span className="text-ink"> Mark as sent</span> zapni až s notifikáciou.
          </p>
        </div>

        <Controller
          control={control}
          name="reminderJob.enabled"
          render={({ field }) => (
            <BoolField
              id="reminder-enabled"
              label="Zapnuté"
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
              label="Spustiť po štarte API"
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
              label="Len po splatnosti"
              hint="Ignoruje faktúry, ktoré ešte nie sú overdue."
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
              label="Označiť ako odoslané"
              hint="Posunie LastReminderSentAt / ReminderCount po dispečingu."
              checked={field.value}
              disabled={pending}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            id="reminder-hour"
            label="Hodina (UTC)"
            disabled={pending}
            error={errors.reminderJob?.runAtHourUtc?.message}
            {...register("reminderJob.runAtHourUtc")}
          />
          <NumberField
            id="reminder-minute"
            label="Minúta (UTC)"
            disabled={pending}
            error={errors.reminderJob?.runAtMinuteUtc?.message}
            {...register("reminderJob.runAtMinuteUtc")}
          />
          <NumberField
            id="reminder-within"
            label="Within days"
            hint="Horizont splatnosti (0–90)."
            disabled={pending}
            error={errors.reminderJob?.withinDays?.message}
            {...register("reminderJob.withinDays")}
          />
          <NumberField
            id="reminder-cooldown"
            label="Min. dní medzi"
            hint="Cooldownoldown podľa LastReminderSentAt."
            disabled={pending}
            error={errors.reminderJob?.minDaysBetweenReminders?.message}
            {...register("reminderJob.minDaysBetweenReminders")}
          />
          <NumberField
            id="reminder-delay"
            label="Startup delay (s)"
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
            "Uložiť joby"
          )}
        </Button>
        <p className="text-[12px] text-faint">
          Zmeny platia hneď pre ďalší cyklus jobu (bez reštartu).
        </p>
      </div>
    </form>
  );
}
