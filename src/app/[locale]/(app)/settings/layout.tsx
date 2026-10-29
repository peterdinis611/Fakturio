import { SettingsNav } from "@/features/settings/ui/settings-nav";
import { PageHeader } from "@/widgets/app-shell/page-header";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Nastavenia"
        description="Firma na faktúrach, vzhľad a plánovanie jobov."
      />
      <SettingsNav />
      {children}
    </div>
  );
}
