import { AppearanceForm } from "@/components/settings/appearance-form";

export const metadata = { title: "Vzhľad" };

export default function AppearanceSettingsPage() {
  return (
    <div>
      <div className="mb-4 max-w-lg">
        <h2 className="text-[15px] font-medium text-ink">Téma</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Farba rozhrania. Platí len v tomto prehliadači.
        </p>
      </div>
      <AppearanceForm />
    </div>
  );
}
