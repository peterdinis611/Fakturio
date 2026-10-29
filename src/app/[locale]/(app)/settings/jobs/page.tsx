import { getJobSettings } from "@/actions/jobs";
import { JobsForm } from "@/components/settings/jobs-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Joby" };

export default async function JobsSettingsPage() {
  const settings = await getJobSettings();

  return (
    <div className="mx-auto max-w-[42rem] space-y-5">
      <Card size="sm" className="rounded-[6px] bg-surface ring-border">
        <CardHeader className="border-b border-rule pb-3">
          <CardTitle className="text-[15px]">Background joby</CardTitle>
          <CardDescription>
            Plánovanie Overdue sync a Reminder jobu. Predvolené hodnoty sú z{" "}
            <span className="font-mono text-[12px] text-ink">appsettings</span>
            , úpravy sa ukladajú do{" "}
            <span className="font-mono text-[12px] text-ink">
              data/job-settings.json
            </span>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <JobsForm initial={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
