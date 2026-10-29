import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import { getCurrentUser } from "@/features/auth/api/auth";
import { redirect } from "@/i18n/navigation";

async function Guard({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/sign-in", locale });
  return children;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}
