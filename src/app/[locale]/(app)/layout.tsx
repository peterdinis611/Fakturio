import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import { getCompanyStatus, getCompanySummary } from "@/features/company/api/company";
import { getCurrentUser } from "@/features/auth/api/auth";
import { AppSidebar } from "@/widgets/app-shell/app-sidebar";
import { CompanyBanner } from "@/widgets/app-shell/company-banner";
import {
  ScrollRestoration,
  ScrollToTopButton,
} from "@/widgets/app-shell/scroll-to-top";
import { PageMotion } from "@/shared/ui/motion/page-motion";
import { isOnboardingSkipped } from "@/shared/lib/onboarding";
import { redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

async function AppShell({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/sign-in", locale });
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

  const hasCompanyName = Boolean(loaded?.summary.name?.trim());
  const skipped = await isOnboardingSkipped();
  if (!hasCompanyName && !skipped) {
    redirect({ href: "/onboarding", locale });
  }

  const summary = loaded?.summary;
  const status = loaded?.status;

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <ScrollRestoration />
      <AppSidebar
        companyName={summary?.name || undefined}
        userEmail={user!.email}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {status ? <CompanyBanner status={status} /> : null}
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
