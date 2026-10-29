import { z } from "zod";

const intField = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().min(min).max(max),
  );

export const overdueJobSchema = z.object({
  enabled: z.boolean(),
  runAtHourUtc: intField(0, 23),
  runAtMinuteUtc: intField(0, 59),
  runOnStartup: z.boolean(),
  startupDelaySeconds: intField(0, 3600),
  disabledRecheckHours: intField(1, 168),
});

export const reminderJobSchema = z.object({
  enabled: z.boolean(),
  runAtHourUtc: intField(0, 23),
  runAtMinuteUtc: intField(0, 59),
  runOnStartup: z.boolean(),
  startupDelaySeconds: intField(0, 3600),
  disabledRecheckHours: intField(1, 168),
  withinDays: intField(0, 90),
  onlyOverdue: z.boolean(),
  minDaysBetweenReminders: intField(0, 365),
  markAsSent: z.boolean(),
});

export const jobSettingsSchema = z.object({
  overdueSync: overdueJobSchema,
  reminderJob: reminderJobSchema,
});

export type JobSettingsFormValues = z.output<typeof jobSettingsSchema>;
export type JobSettingsFormInput = z.input<typeof jobSettingsSchema>;
