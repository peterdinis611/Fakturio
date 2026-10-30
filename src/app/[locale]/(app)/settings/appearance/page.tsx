import { getTranslations } from "next-intl/server";
import { AppearanceForm } from "@/features/settings/ui/appearance-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export async function generateMetadata() {
  const t = await getTranslations("Settings");
  return { title: t("appearanceTitle") };
}

export default async function AppearanceSettingsPage() {
  const t = await getTranslations("Settings");

  return (
    <Card size="sm" className="rounded-[6px] bg-surface ring-border">
      <CardHeader className="border-b border-rule pb-3">
        <CardTitle className="text-[15px]">{t("theme")}</CardTitle>
        <CardDescription>{t("appearanceDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <AppearanceForm />
      </CardContent>
    </Card>
  );
}
