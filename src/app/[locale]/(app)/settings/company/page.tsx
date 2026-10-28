import { getCompany } from "@/actions/company";
import { CompanyForm } from "@/components/company/company-form";

export const metadata = { title: "Firma" };

export default async function CompanySettingsPage() {
  const company = await getCompany();
  const c = company.completeness;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-medium text-ink">Firma</h2>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {c.isReadyToInvoice
              ? "Údaje dodávateľa na faktúrach a PDF."
              : `${c.percentComplete}% hotové — doplň povinné polia.`}
          </p>
        </div>
        <p className="ledger-strip mb-0 border-0 pb-0">
          <span>
            {c.completedRequired}/{c.totalRequired} povinných
          </span>
          <span
            className={c.isReadyToInvoice ? "text-positive" : "text-warning"}
          >
            {c.isReadyToInvoice ? "Pripravené" : "Doplniť"}
          </span>
        </p>
      </div>

      {!c.isReadyToInvoice ? (
        <ul className="mb-6 max-w-[40rem] space-y-1 border border-border bg-surface px-4 py-3 text-[13px]">
          {c.items
            .filter((i) => i.isRequired && !i.isComplete)
            .map((i) => (
              <li key={i.key} className="text-warning">
                {i.label}
                {i.hint ? (
                  <span className="text-muted-foreground"> — {i.hint}</span>
                ) : null}
              </li>
            ))}
        </ul>
      ) : null}

      <CompanyForm initial={company} mode="settings" />
    </div>
  );
}
