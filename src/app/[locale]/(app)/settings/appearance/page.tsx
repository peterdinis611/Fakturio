import { AppearanceForm } from "@/features/settings/ui/appearance-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export const metadata = { title: "Vzhľad" };

export default function AppearanceSettingsPage() {
  return (
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
  );
}
