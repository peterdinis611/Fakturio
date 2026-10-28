import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import { getCompanyStatus, getCompanySummary } from "@/actions/company";
import { ensureCurrentUser } from "@/actions/users";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CompanyBanner } from "@/components/layout/company-banner";
import {
  ScrollRestoration,
  ScrollToTopButton,
} from "@/components/layout/scroll-to-top";
import { PageMotion } from "@/components/motion/page-motion";
import { redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

async function AppShell({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const session = await auth();
  if (!session.isAuthenticated) {
    redirect({ href: "/sign-in", locale });
  }

  try {
    await ensureCurrentUser();
  } catch {
    // Sync is best-effort; API may be down during first boot.
  }

  let loaded:
    | {
        summary: Awaited<ReturnType<typeof getCompanySummary>>;
        status: Awaited<ReturnType<typeof getCompanyStatus>>;
      }
    | undefined;
  try {
    const [summary, status] = await Promise.all([
      getCompanySummary(),
      getCompanyStatus(),
    ]);
    loaded = { summary, status };
  } catch {
    loaded = undefined;
  }

  if (!loaded?.summary.name?.trim()) {
    redirect({ href: "/onboarding", locale });
  }

  const { summary, status } = loaded!;

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <ScrollRestoration />
      <AppSidebar companyName={summary.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <CompanyBanner status={status} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1152px]">
            <PageMotion>{children}</PageMotion>
          </div>
        </main>
      </div>
      <ScrollToTopButton />
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
