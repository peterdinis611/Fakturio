import { UserProfile } from "@clerk/nextjs";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { PageLoader } from "@/components/ui/spinner";

export const metadata = { title: "Profil" };

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil"
        description="Účet, e-mail a zabezpečenie cez Clerk."
      />
      <div className="overflow-hidden">
        <Suspense fallback={<PageLoader label="Načítavam profil…" />}>
          <UserProfile
            routing="path"
            path="/profile"
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none",
              },
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
