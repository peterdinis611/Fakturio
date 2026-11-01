"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "@/shared/toast";
import {
  sendTestNotificationAction,
  updateNotificationPreferencesAction,
} from "@/features/notifications/api/notifications";
import type { NotificationPreferences } from "@/features/notifications/model/types";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Spinner } from "@/shared/ui/spinner";

type FormValues = {
  remindersEnabled: boolean;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  withinDays: number;
  onlyOverdue: boolean;
  quietEnabled: boolean;
  quietHoursStartUtc: number;
  quietHoursEndUtc: number;
};

export function NotificationPrefsForm({
  initial,
}: {
  initial: NotificationPreferences;
}) {
  const t = useTranslations("Notifications");
  const [pending, startTransition] = useTransition();
  const [testing, startTest] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      remindersEnabled: initial.remindersEnabled,
      inAppEnabled: initial.inAppEnabled,
      emailEnabled: initial.emailEnabled,
      withinDays: initial.withinDays,
      onlyOverdue: initial.onlyOverdue,
      quietEnabled:
        initial.quietHoursStartUtc != null && initial.quietHoursEndUtc != null,
      quietHoursStartUtc: initial.quietHoursStartUtc ?? 22,
      quietHoursEndUtc: initial.quietHoursEndUtc ?? 6,
    },
  });

  const quietEnabled = watch("quietEnabled");
  const remindersEnabled = watch("remindersEnabled");

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await updateNotificationPreferencesAction({
        remindersEnabled: values.remindersEnabled,
        inAppEnabled: values.inAppEnabled,
        emailEnabled: values.emailEnabled,
        withinDays: values.withinDays,
        onlyOverdue: values.onlyOverdue,
        clearQuietHours: !values.quietEnabled,
        quietHoursStartUtc: values.quietEnabled
          ? values.quietHoursStartUtc
          : undefined,
        quietHoursEndUtc: values.quietEnabled
          ? values.quietHoursEndUtc
          : undefined,
      });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("saveFailed"));
        return;
      }
      toast.success(t("saved"));
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <p className="text-[13px] text-muted-foreground">{t("prefsLead")}</p>

      <Controller
        name="remindersEnabled"
        control={control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={field.value}
              onCheckedChange={(v) => field.onChange(Boolean(v))}
              disabled={pending}
            />
            <span>
              <span className="block text-[13px] font-medium text-ink">
                {t("remindersEnabled")}
              </span>
              <span className="text-[12px] text-muted-foreground">
                {t("remindersEnabledHint")}
              </span>
            </span>
          </label>
        )}
      />

      <fieldset
        disabled={!remindersEnabled || pending}
        className="space-y-3 disabled:opacity-50"
      >
        <Controller
          name="inAppEnabled"
          control={control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={field.value}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
              />
              <span>
                <span className="block text-[13px] font-medium text-ink">
                  {t("inAppEnabled")}
                </span>
                <span className="text-[12px] text-muted-foreground">
                  {t("inAppEnabledHint")}
                </span>
              </span>
            </label>
          )}
        />

        <Controller
          name="emailEnabled"
          control={control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={field.value}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
              />
              <span>
                <span className="block text-[13px] font-medium text-ink">
                  {t("emailEnabled")}
                </span>
                <span className="text-[12px] text-muted-foreground">
                  {t("emailEnabledHint")}
                </span>
              </span>
            </label>
          )}
        />

        <Controller
          name="onlyOverdue"
          control={control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={field.value}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
              />
              <span>
                <span className="block text-[13px] font-medium text-ink">
                  {t("onlyOverdue")}
                </span>
                <span className="text-[12px] text-muted-foreground">
                  {t("onlyOverdueHint")}
                </span>
              </span>
            </label>
          )}
        />

        <div className="grid gap-1.5">
          <Label htmlFor="withinDays">{t("withinDays")}</Label>
          <Input
            id="withinDays"
            type="number"
            min={0}
            max={90}
            className="data-num h-9 max-w-[8rem]"
            {...register("withinDays", { valueAsNumber: true })}
          />
          <p className="text-[12px] text-faint">{t("withinDaysHint")}</p>
        </div>

        <Controller
          name="quietEnabled"
          control={control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={field.value}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
              />
              <span>
                <span className="block text-[13px] font-medium text-ink">
                  {t("quietHours")}
                </span>
                <span className="text-[12px] text-muted-foreground">
                  {t("quietHoursHint")}
                </span>
              </span>
            </label>
          )}
        />

        {quietEnabled ? (
          <div className="flex flex-wrap gap-3 pl-7">
            <div className="grid gap-1.5">
              <Label htmlFor="quietStart">{t("quietStart")}</Label>
              <Input
                id="quietStart"
                type="number"
                min={0}
                max={23}
                className="data-num h-9 w-20"
                {...register("quietHoursStartUtc", { valueAsNumber: true })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="quietEnd">{t("quietEnd")}</Label>
              <Input
                id="quietEnd"
                type="number"
                min={0}
                max={23}
                className="data-num h-9 w-20"
                {...register("quietHoursEndUtc", { valueAsNumber: true })}
              />
            </div>
          </div>
        ) : null}
      </fieldset>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={pending || testing || !isDirty}>
          {pending ? <Spinner className="size-4" /> : null}
          {t("save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending || testing}
          onClick={() => {
            startTest(async () => {
              const result = await sendTestNotificationAction({});
              if (!result?.data) {
                toast.error(actionErrorMessage(result ?? {}) ?? t("testFailed"));
                return;
              }
              toast.success(t("testSent"));
            });
          }}
        >
          {testing ? <Spinner className="size-4" /> : null}
          {t("sendTest")}
        </Button>
      </div>
    </form>
  );
}
