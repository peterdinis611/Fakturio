import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { listAdminUsers } from "@/features/admin/api/admin";
import { getCurrentUser } from "@/features/auth/api/auth";
import { redirect } from "@/i18n/navigation";
import { ServerLink as Link } from "@/i18n/server-link";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { AdminUsersBody } from "@/widgets/admin/admin-users";
import { SectionLoader } from "@/shared/ui/spinner";

export async function generateMetadata() {
  const t = await getTranslations("Admin");
  return { title: t("usersTitle") };
}

export default async function AdminUsersPage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    redirect({ href: "/dashboard", locale });
  }

  const dataPromise = listAdminUsers({ page: 1, pageSize: 50 });
  const t = await getTranslations("Admin");
  const tl = await getTranslations("Loading");

  return (
    <div>
      <PageHeader
        title={t("usersTitle")}
        description={t("usersLead")}
        actions={
          <Link
            href="/admin"
            className="text-[13px] text-muted-foreground underline-offset-2 hover:text-ink hover:underline"
          >
            {t("backOverview")}
          </Link>
        }
      />
      <Suspense
        fallback={
          <SectionLoader label={tl("dashboard")} rows={6} className="mt-2" />
        }
      >
        <AdminUsersBody dataPromise={dataPromise} />
      </Suspense>
    </div>
  );
}
