import { getCompany } from "@/actions/company";
import { CompanyForm } from "@/components/company/company-form";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Firma" };

export default async function CompanySettingsPage() {
  const company = await getCompany();
  const c = company.completeness;

  return (
    <div>
      <PageHeader
        title="Firma"
        description={
          c.isReadyToInvoice
            ? "Údaje dodávateľa na faktúrach a PDF."
            : `${c.percentComplete}%: doplň povinné polia pred ďalšou faktúrou.`
        }
      />

      {!c.isReadyToInvoice ? (
        <ul className="mb-8 space-y-1 border-b border-border pb-8 text-[14px]">
          {c.items
            .filter((i) => i.isRequired && !i.isComplete)
            .map((i) => (
              <li key={i.key} className="text-warning">
                {i.label}
                {i.hint ? (
                  <span className="text-muted-foreground">: {i.hint}</span>
                ) : null}
              </li>
            ))}
        </ul>
      ) : null}

      <CompanyForm initial={company} mode="settings" />
    </div>
  );
}
