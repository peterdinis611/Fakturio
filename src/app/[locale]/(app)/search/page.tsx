import { listCustomers } from "@/features/customers/api/customers";
import { listInvoices } from "@/features/invoices/api/invoices";
import { FuzzySearchPanel } from "@/features/search/ui/fuzzy-search-panel";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { FadeIn } from "@/shared/ui/motion/page-motion";

export const metadata = { title: "Hľadanie" };

const CATALOG_SIZE = 500;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [customers, invoices] = await Promise.all([
    listCustomers({ page: 1, pageSize: CATALOG_SIZE }),
    listInvoices({ page: 1, pageSize: CATALOG_SIZE }),
  ]);

  const truncated =
    customers.totalCount > customers.items.length ||
    invoices.totalCount > invoices.items.length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Hľadanie"
        description="Fuzzy hľadanie (fuse.js) v zákazníkoch a faktúrach — aspoň 2 znaky."
      />

      <FadeIn delay={0.05}>
        <FuzzySearchPanel
          customers={customers.items}
          invoices={invoices.items}
          initialQuery={query}
          truncated={truncated}
        />
      </FadeIn>
    </div>
  );
}
