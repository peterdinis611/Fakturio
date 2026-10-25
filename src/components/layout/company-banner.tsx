import Link from "next/link";
import type { CompanyCompleteness } from "@/lib/api/types";

export function CompanyBanner({ status }: { status: CompanyCompleteness }) {
  if (status.isReadyToInvoice) return null;

  const missing = status.items
    .filter((i) => i.isRequired && !i.isComplete)
    .map((i) => i.label)
    .slice(0, 3);

  return (
    <div className="border-b border-border bg-pill-warning-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-[13px] text-pill-warning-ink sm:px-6 lg:px-8">
        <p>
          Firma nie je pripravená na fakturáciu ({status.percentComplete}%).
          Chýba: {missing.join(", ") || "povinné údaje"}.
        </p>
        <Link
          href="/settings/company"
          className="font-medium underline-offset-2 hover:underline"
        >
          Doplniť
        </Link>
      </div>
    </div>
  );
}
