import { AppearanceForm } from "@/components/settings/appearance-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Vzhľad" };

export default function AppearanceSettingsPage() {
  return (
    <div className="mx-auto max-w-[42rem]">
      <Card size="sm" className="rounded-[6px] bg-surface ring-border">
        <CardHeader className="border-b border-rule pb-3">
          <CardTitle className="text-[15px]">Téma</CardTitle>
          <CardDescription>
            Farba rozhrania. Platí len v tomto prehliadači.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <AppearanceForm />
        </CardContent>
      </Card>
    </div>
  );
}
