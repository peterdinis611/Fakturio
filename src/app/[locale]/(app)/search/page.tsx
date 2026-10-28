import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/page-motion";
import { SearchBox } from "@/components/search/search-box";
import { SearchIdle } from "@/components/search/search-empty";
import { SearchResults } from "@/components/search/search-results";
import { SectionLoader } from "@/components/ui/spinner";

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
