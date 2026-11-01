import { getTranslations } from "next-intl/server";
import { getNotificationPreferences } from "@/features/notifications/api/notifications";
import { NotificationPrefsForm } from "@/features/notifications/ui/notification-prefs-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export async function generateMetadata() {
  const t = await getTranslations("Settings");
  return { title: t("notificationsTitle") };
}

export default async function NotificationSettingsPage() {
  const t = await getTranslations("Settings");
  const prefs = await getNotificationPreferences();

  return (
    <Card size="sm" className="rounded-[6px] bg-surface ring-border">
      <CardHeader className="border-b border-rule pb-3">
        <CardTitle className="text-[15px]">{t("notificationsTitle")}</CardTitle>
        <CardDescription>{t("notificationsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <NotificationPrefsForm initial={prefs} />
      </CardContent>
    </Card>
  );
}
