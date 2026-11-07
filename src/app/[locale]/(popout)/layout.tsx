import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/features/auth/api/auth";
import { redirect } from "@/i18n/navigation";

/** Minimal chrome for widgets opened in a separate window. */
export default async function PopoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const user = await getCurrentUser();

  if (!user) {
    redirect({ href: "/sign-in", locale });
  }

  return (
    <div className="min-h-full bg-ground text-ink">
      <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        {children}
      </main>
    </div>
  );
}
