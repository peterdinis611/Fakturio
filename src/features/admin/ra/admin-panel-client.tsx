"use client";

import dynamic from "next/dynamic";

const AdminApp = dynamic(
  () => import("./admin-app").then((m) => m.AdminAppLoaded),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading admin panel…
      </div>
    ),
  },
);

export function AdminPanelClient({ basename }: { basename: string }) {
  return <AdminApp basename={basename} />;
}
