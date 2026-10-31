import { getTranslations } from "next-intl/server";
import { getCompany } from "@/features/company/api/company";
import { lookupCustomers } from "@/features/customers/api/customers";
import { listRecurring } from "@/features/recurring/api/recurring";
import { RecurringTable } from "@/features/recurring/ui/recurring-table";
import { listServices } from "@/features/services/api/services";
import { PageHeader } from "@/widgets/app-shell/page-header";

export async function generateMetadata() {
  const t = await getTranslations("Recurring");
  return { title: t("title") };
}

export default async function RecurringPage() {
  const t = await getTranslations("Recurring");
  const [data, company, customers, services] = await Promise.all([
    listRecurring({ pageSize: 100 }),
    getCompany(),
    lookupCustomers({ limit: 100 }),
    listServices({ pageSize: 100, activeOnly: true }),
  ]);

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <RecurringTable
        items={data.items}
        customers={customers}
        catalogItems={services.items}
        isVatPayer={company.isVatPayer}
        defaultVatRate={company.defaultVatRate}
        defaultDueDays={company.defaultDueDays}
      />
    </div>
  );
}
