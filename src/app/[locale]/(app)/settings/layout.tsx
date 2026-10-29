import { SettingsNav } from "@/components/settings/settings-nav";
import { PageHeader } from "@/components/layout/page-header";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Nastavenia"
        description="Firma na faktúrach, vzhľad a plánovanie jobov."
      />
      <SettingsNav />
      {children}
    </div>
  );
}
