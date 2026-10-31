"use client";

import { useTransition, type ComponentProps } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Settings");
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
        toast.error(
          actionErrorMessage(result ?? {}) ?? t("jobsSaveFailed"),
        );
        return;
      }
      toast.success(t("jobsSaved"));
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
            {t("overdueJob")}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {t("overdueJobBody")}
          </p>
        </div>

        <Controller
          control={control}
          name="overdueSync.enabled"
          render={({ field }) => (
            <BoolField
              id="overdue-enabled"
              label={t("enableCheck")}
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
              label={t("runOnStartup")}
              hint={t("runOnStartupHint")}
              checked={field.value}
              disabled={pending}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            id="overdue-hour"
            label={t("hour")}
            hint={t("utc")}
            disabled={pending}
            error={errors.overdueSync?.runAtHourUtc?.message}
            {...register("overdueSync.runAtHourUtc")}
          />
          <NumberField
            id="overdue-minute"
            label={t("minute")}
            hint={t("utc")}
            disabled={pending}
            error={errors.overdueSync?.runAtMinuteUtc?.message}
            {...register("overdueSync.runAtMinuteUtc")}
          />
          <NumberField
            id="overdue-delay"
            label={t("startupDelay")}
            hint={t("startupDelayHint")}
            disabled={pending}
            error={errors.overdueSync?.startupDelaySeconds?.message}
            {...register("overdueSync.startupDelaySeconds")}
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-rule pt-5">
        <div>
          <h2 className="text-[15px] font-medium text-ink">{t("remindersSection")}</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {t("remindersJobBody")}
          </p>
        </div>

        <Controller
          control={control}
          name="reminderJob.enabled"
          render={({ field }) => (
            <BoolField
              id="reminder-enabled"
              label={t("remindersJob")}
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
              label={t("runOnStartup")}
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
              label={t("onlyOverdue")}
              hint={t("onlyOverdueHint")}
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
              label={t("markAsSentLabel")}
              hint={t("markAsSentDetail")}
              checked={field.value}
              disabled={pending}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            id="reminder-hour"
            label={t("hour")}
            hint={t("utc")}
            disabled={pending}
            error={errors.reminderJob?.runAtHourUtc?.message}
            {...register("reminderJob.runAtHourUtc")}
          />
          <NumberField
            id="reminder-minute"
            label={t("minute")}
            hint={t("utc")}
            disabled={pending}
            error={errors.reminderJob?.runAtMinuteUtc?.message}
            {...register("reminderJob.runAtMinuteUtc")}
          />
          <NumberField
            id="reminder-within"
            label={t("withinDaysLabel")}
            hint={t("withinDaysHint")}
            disabled={pending}
            error={errors.reminderJob?.withinDays?.message}
            {...register("reminderJob.withinDays")}
          />
          <NumberField
            id="reminder-cooldown"
            label={t("cooldownLabel")}
            hint={t("cooldownHint")}
            disabled={pending}
            error={errors.reminderJob?.minDaysBetweenReminders?.message}
            {...register("reminderJob.minDaysBetweenReminders")}
          />
          <NumberField
            id="reminder-delay"
            label={t("startupDelay")}
            hint={t("startupDelayHint")}
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
              <Spinner size="sm" label={t("save")} />
              {t("save")}…
            </>
          ) : (
            t("save")
          )}
        </Button>
        <p className="text-[12px] text-faint">{t("jobsApplyNote")}</p>
      </div>
    </form>
  );
}
