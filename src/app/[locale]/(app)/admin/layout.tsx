import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/features/auth/api/auth";
import { redirect } from "@/i18n/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    redirect({ href: "/dashboard", locale });
  }

  return children;
}
