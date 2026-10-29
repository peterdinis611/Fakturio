import { Suspense } from "react";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { FadeIn } from "@/shared/ui/motion/page-motion";
import { SearchBox } from "@/features/search/ui/search-box";
import { SearchIdle } from "@/features/search/ui/search-empty";
import { SearchResults } from "@/features/search/ui/search-results";
import { SectionLoader } from "@/shared/ui/spinner";

export const metadata = { title: "Hľadanie" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Hľadanie"
        description="Zákazníci a faktúry naraz — aspoň 2 znaky."
      />

      <FadeIn delay={0.05}>
        <SearchBox initialQuery={query} />
      </FadeIn>

      {!query ? (
        <FadeIn delay={0.1}>
          <SearchIdle />
        </FadeIn>
      ) : (
        <Suspense
          fallback={
            <SectionLoader label="Hľadám…" rows={5} className="mt-2" />
          }
        >
          <SearchResults query={query} />
        </Suspense>
      )}
    </div>
  );
}
