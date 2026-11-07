import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { listCustomers } from "@/features/customers/api/customers";
import { CreateCustomerDialog } from "@/features/customers/ui/create-customer-dialog";
import { CustomersFuzzyTable } from "@/features/customers/ui/customers-fuzzy-table";
import { DocumentsAreaNav } from "@/features/invoices/ui/documents-area-nav";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { SectionLoader } from "@/shared/ui/spinner";
import type { Customer, PagedResponse } from "@/shared/api/types";

export async function generateMetadata() {
  const t = await getTranslations("Customers");
  return { title: t("title") };
}

const CATALOG_SIZE = 100;

function loadCustomersCatalog(): Promise<PagedResponse<Customer>> {
  return listCustomers({ page: 1, pageSize: CATALOG_SIZE });
}

async function CustomersBody({
  dataPromise,
  initialQuery,
}: {
  dataPromise: Promise<PagedResponse<Customer>>;
  initialQuery: string;
}) {
  const t = await getTranslations("Customers");
  const data = await dataPromise;

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description", { count: data.totalCount })}
        actions={<CreateCustomerDialog />}
      />

      <CustomersFuzzyTable
        items={data.items}
        initialQuery={initialQuery}
        truncated={data.totalCount > data.items.length}
      />
    </>
  );
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const dataPromise = loadCustomersCatalog();
  const t = await getTranslations("Customers");
  const tl = await getTranslations("Loading");
  const sp = await searchParams;
  const search = sp.q?.trim() || "";

  return (
    <div>
      <DocumentsAreaNav />
      <Suspense
        fallback={
          <>
            <PageHeader title={t("title")} />
            <SectionLoader label={tl("customers")} rows={8} className="mt-2" />
          </>
        }
      >
        <CustomersBody dataPromise={dataPromise} initialQuery={search} />
      </Suspense>
    </div>
  );
}
