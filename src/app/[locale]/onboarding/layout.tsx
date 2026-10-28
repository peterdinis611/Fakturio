import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

async function Guard({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) redirect({ href: "/sign-in", locale });
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
