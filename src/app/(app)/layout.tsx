import { redirect } from "next/navigation";
import { getCompanyStatus, getCompanySummary } from "@/actions/company";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CompanyBanner } from "@/components/layout/company-banner";
import {
  ScrollRestoration,
  ScrollToTopButton,
} from "@/components/layout/scroll-to-top";
import { PageMotion } from "@/components/motion/page-motion";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let summary;
  let status;
  try {
    [summary, status] = await Promise.all([
      getCompanySummary(),
      getCompanyStatus(),
    ]);
  } catch {
    redirect("/onboarding");
  }

  if (!summary.name?.trim()) {
    redirect("/onboarding");
  }

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
