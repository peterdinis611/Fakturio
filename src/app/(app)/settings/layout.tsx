import { SettingsNav } from "@/components/settings/settings-nav";
import { PageHeader } from "@/components/layout/page-header";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PageHeader
        title="Nastavenia"
        description="Firma na faktúrach a vzhľad aplikácie."
      />
      <SettingsNav />
      {children}
    </div>
  );
}
