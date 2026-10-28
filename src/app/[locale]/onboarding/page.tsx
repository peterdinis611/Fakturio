import { getCompany } from "@/actions/company";
import { CompanyForm } from "@/components/company/company-form";

export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const company = await getCompany();

  return (
    <div className="min-h-full bg-ground">
      <div className="app-column max-w-3xl py-12">
        <p className="text-[15px] font-semibold tracking-tight text-ink">
          Fakturio
        </p>
        <h1 className="mt-6 text-[24px] font-semibold tracking-[-0.01em] text-ink">
          Nastavenie firmy
        </h1>
        <p className="mt-2 max-w-xl text-[14px] text-muted-foreground">
          Údaje do hlavičky faktúry a platobného pásu (IČO, IBAN, DPH). Neskôr
          ich upravíš vo Firma.
        </p>
        <p className="mt-4 text-[12px] text-muted-foreground">
          Hotové {company.completeness.completedRequired} z{" "}
          {company.completeness.totalRequired} povinných ·{" "}
          <span className="data-num text-ink">
            {company.completeness.percentComplete}%
          </span>
        </p>
        <div className="mt-8">
          <CompanyForm initial={company} mode="onboarding" />
        </div>
      </div>
    </div>
  );
}
