import { getTranslations } from "next-intl/server";
import { getNotificationPreferences } from "@/features/notifications/api/notifications";
import { NotificationPrefsForm } from "@/features/notifications/ui/notification-prefs-form";
import { getEmailStatus } from "@/features/emails/api/emails";
import { EmailStatusPanel } from "@/features/emails/ui/email-status-panel";
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
  const [prefs, emailStatus] = await Promise.all([
    getNotificationPreferences(),
    getEmailStatus().catch(() => null),
  ]);

  return (
    <Card size="sm" className="rounded-[6px] bg-surface ring-border">
      <CardHeader className="border-b border-rule pb-3">
        <CardTitle className="text-[15px]">{t("notificationsTitle")}</CardTitle>
        <CardDescription>{t("notificationsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        {emailStatus ? <EmailStatusPanel status={emailStatus} /> : null}
        <NotificationPrefsForm initial={prefs} />
      </CardContent>
    </Card>
  );
}
