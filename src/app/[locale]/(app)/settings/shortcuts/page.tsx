import { getTranslations } from "next-intl/server";
import { ShortcutsForm } from "@/features/settings/ui/shortcuts-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export async function generateMetadata() {
  const t = await getTranslations("Settings");
  return { title: t("shortcutsTitle") };
}

export default async function ShortcutsSettingsPage() {
  const t = await getTranslations("Settings");

  return (
    <Card size="sm" className="rounded-[6px] bg-surface ring-border">
      <CardHeader className="border-b border-rule pb-3">
        <CardTitle className="text-[15px]">{t("shortcutsTitle")}</CardTitle>
        <CardDescription>{t("shortcutsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ShortcutsForm />
      </CardContent>
    </Card>
  );
}
