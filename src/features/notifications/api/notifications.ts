"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import { ActionError, actionClient } from "@/shared/lib/safe-action";
import type {
  AppNotification,
  NotificationList,
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
} from "@/features/notifications/model/types";

export async function listNotifications(
  take = 30,
): Promise<NotificationList> {
  return apiFetch<NotificationList>("/api/notifications", {
    searchParams: { take },
    next: { tags: ["notifications"], revalidate: 15 },
  });
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiFetch<NotificationPreferences>("/api/notifications/preferences", {
    next: { tags: ["notification-prefs"], revalidate: 60 },
  });
}

function revalidateNotifications() {
  revalidateTag("notifications", "max");
  revalidateTag("notification-prefs", "max");
  revalidatePath("/reminders");
  revalidatePath("/settings/notifications");
}

export const markNotificationReadAction = actionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    try {
      await apiFetch<void>(`/api/notifications/${parsedInput.id}/read`, {
        method: "POST",
      });
      revalidateNotifications();
      return { ok: true as const };
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const markAllNotificationsReadAction = actionClient
  .inputSchema(z.object({}).optional())
  .action(async () => {
    try {
      await apiFetch<void>("/api/notifications/read-all", { method: "POST" });
      revalidateNotifications();
      return { ok: true as const };
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

const prefsSchema = z.object({
  remindersEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  withinDays: z.number().int().min(0).max(90).optional(),
  onlyOverdue: z.boolean().optional(),
  quietHoursStartUtc: z.number().int().min(0).max(23).nullable().optional(),
  quietHoursEndUtc: z.number().int().min(0).max(23).nullable().optional(),
  clearQuietHours: z.boolean().optional(),
});

export const updateNotificationPreferencesAction = actionClient
  .inputSchema(prefsSchema)
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<NotificationPreferences>(
        "/api/notifications/preferences",
        {
          method: "PUT",
          body: parsedInput satisfies UpdateNotificationPreferencesInput,
        },
      );
      revalidateNotifications();
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const sendTestNotificationAction = actionClient
  .inputSchema(z.object({}).optional())
  .action(async () => {
    try {
      const data = await apiFetch<AppNotification>(
        "/api/notifications/test",
        { method: "POST" },
      );
      revalidateNotifications();
      return data;
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
