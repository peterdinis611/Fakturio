import { getJobSettings } from "@/actions/jobs";
import { JobsForm } from "@/components/settings/jobs-form";

export const metadata = { title: "Joby" };

export default async function JobsSettingsPage() {
  const settings = await getJobSettings();

  return (
    <div>
      <div className="mb-6 max-w-2xl">
        <h2 className="text-[15px] font-medium text-ink">Background joby</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Plánovanie Overdue sync a Reminder jobu. Predvolené hodnoty sú z{" "}
          <span className="font-mono text-[13px] text-ink">appsettings</span>,
          úpravy sa ukladajú do{" "}
          <span className="font-mono text-[13px] text-ink">
            data/job-settings.json
          </span>
          .
        </p>
      </div>
      <JobsForm initial={settings} />
    </div>
  );
}
