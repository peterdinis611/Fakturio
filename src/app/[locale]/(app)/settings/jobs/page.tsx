import { getJobSettings } from "@/features/settings/api/jobs";
import { JobsForm } from "@/features/settings/ui/jobs-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export const metadata = { title: "Automatizácia" };

export default async function JobsSettingsPage() {
  const settings = await getJobSettings();

  return (
    <div className="mx-auto max-w-[42rem] space-y-5">
      <Card size="sm" className="rounded-[6px] bg-surface ring-border">
        <CardHeader className="border-b border-rule pb-3">
          <CardTitle className="text-[15px]">Automatické kontroly</CardTitle>
          <CardDescription>
            Denne skontroluje splatnosti a pripraví upomienky. Čas je v UTC
            (na Slovensku +1 h v zime, +2 h v lete).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <JobsForm initial={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
