import { getCompany } from "@/features/company/api/company";
import { listServices } from "@/features/services/api/services";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { ServiceCatalogTable } from "@/features/services/ui/service-catalog-table";

export const metadata = { title: "Katalóg služieb" };

export default async function ServicesPage() {
  const [data, company] = await Promise.all([
    listServices({ pageSize: 100 }),
    getCompany(),
  ]);

  return (
    <div>
      <PageHeader
        title="Katalóg služieb"
        description="Opakované položky na faktúry — popis, cena a DPH na jedno miesto."
        ledger={
          <>
            <span>{data.totalCount} položiek</span>
            <span>
              {company.isVatPayer
                ? `Platca DPH · predvolené ${company.defaultVatRate}%`
                : "Neplatca DPH"}
            </span>
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
