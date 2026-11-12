import { getTranslations } from "next-intl/server";
import { SearchQueryBar } from "@/features/search/ui/search-query-bar";
import { SearchResults } from "@/features/search/ui/search-results";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { FadeIn } from "@/shared/ui/motion/page-motion";
import { Suspense } from "react";

export async function generateMetadata() {
  const t = await getTranslations("Search");
  return { title: t("title") };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getTranslations("Search");
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t("title")} description={t("description")} />

      <FadeIn delay={0.05}>
        <SearchQueryBar initialQuery={query} />
        <Suspense
          fallback={
            <p className="text-[13px] text-muted-foreground">{t("loading")}</p>
          }
        >
          <SearchResults query={query} />
        </Suspense>
      </FadeIn>
    </div>
  );
}
