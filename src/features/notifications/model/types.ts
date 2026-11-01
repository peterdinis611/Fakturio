export type AppNotification = {
  id: string;
  kind: "Reminder" | "System" | number;
  title: string;
  body: string;
  href: string | null;
  invoiceId: string | null;
  invoiceNumber: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

export type NotificationList = {
  items: AppNotification[];
  unreadCount: number;
};

export type NotificationPreferences = {
  remindersEnabled: boolean;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  withinDays: number;
  onlyOverdue: boolean;
  quietHoursStartUtc: number | null;
  quietHoursEndUtc: number | null;
  updatedAt: string;
};

export type UpdateNotificationPreferencesInput = {
  remindersEnabled?: boolean;
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  withinDays?: number;
  onlyOverdue?: boolean;
  quietHoursStartUtc?: number | null;
  quietHoursEndUtc?: number | null;
  clearQuietHours?: boolean;
};
