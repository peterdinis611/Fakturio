import { getTranslations } from "next-intl/server";
import { listCustomers } from "@/features/customers/api/customers";
import { CreateCustomerDialog } from "@/features/customers/ui/create-customer-dialog";
import { CustomersFuzzyTable } from "@/features/customers/ui/customers-fuzzy-table";
import { PageHeader } from "@/widgets/app-shell/page-header";

export async function generateMetadata() {
  const t = await getTranslations("Customers");
  return { title: t("title") };
}

const CATALOG_SIZE = 500;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getTranslations("Customers");
  const sp = await searchParams;
  const search = sp.q?.trim() || "";
  const data = await listCustomers({ page: 1, pageSize: CATALOG_SIZE });

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description", { count: data.totalCount })}
        actions={<CreateCustomerDialog />}
      />

      <CustomersFuzzyTable
        items={data.items}
        initialQuery={search}
        truncated={data.totalCount > data.items.length}
      />
    </div>
  );
}
