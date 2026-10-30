import { getTranslations } from "next-intl/server";
import { getCompany } from "@/features/company/api/company";
import { listServices } from "@/features/services/api/services";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { ServiceCatalogTable } from "@/features/services/ui/service-catalog-table";

export async function generateMetadata() {
  const t = await getTranslations("Services");
  return { title: t("title") };
}

export default async function ServicesPage() {
  const t = await getTranslations("Services");
  const [data, company] = await Promise.all([
    listServices({ pageSize: 100 }),
    getCompany(),
  ]);

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        ledger={
          <>
            <span>{data.totalCount}</span>
            {company.isVatPayer ? (
              <span>{company.defaultVatRate}%</span>
            ) : null}
          </>
        }
      />
      <ServiceCatalogTable
        items={data.items}
        isVatPayer={company.isVatPayer}
        defaultVatRate={company.defaultVatRate}
      />
    </div>
  );
}
