import { getTranslations } from "next-intl/server";
import { getJobSettings } from "@/features/settings/api/jobs";
import { JobsForm } from "@/features/settings/ui/jobs-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export async function generateMetadata() {
  const t = await getTranslations("Settings");
  return { title: t("jobsTitle") };
}

export default async function JobsSettingsPage() {
  const t = await getTranslations("Settings");
  const settings = await getJobSettings();

  return (
    <div className="mx-auto max-w-[42rem] space-y-5">
      <Card size="sm" className="rounded-[6px] bg-surface ring-border">
        <CardHeader className="border-b border-rule pb-3">
          <CardTitle className="text-[15px]">{t("jobsTitle")}</CardTitle>
          <CardDescription>{t("jobsLead")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <JobsForm initial={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
