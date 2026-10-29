import { getCurrentUser } from "@/actions/auth";
import { PageHeader } from "@/components/layout/page-header";
import { emptyDash, formatDateTime } from "@/lib/format";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/sign-in", locale });
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil"
        description="Účet prihlásený cez Fakturio JWT."
      />
      <div className="panel space-y-3 px-5 py-4 text-[14px]">
        <div>
          <p className="text-[12px] text-muted-foreground">E-mail</p>
          <p className="font-medium text-ink">{user.email}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[12px] text-muted-foreground">Meno</p>
            <p>{emptyDash(user.firstName)}</p>
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">Priezvisko</p>
            <p>{emptyDash(user.lastName)}</p>
          </div>
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Účet vytvorený</p>
          <p className="data-num text-[12px]">
            {formatDateTime(user.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
