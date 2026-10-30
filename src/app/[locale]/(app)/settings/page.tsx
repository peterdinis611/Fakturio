import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  const t = await getTranslations("Settings");
  return { title: t("title") };
}

export default function SettingsIndexPage() {
  redirect("/settings/company");
}
