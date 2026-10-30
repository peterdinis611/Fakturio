import { getTranslations } from "next-intl/server";
import { getCompany } from "@/features/company/api/company";
import { CompanyForm } from "@/features/company/ui/company-form";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { cn } from "@/shared/lib/utils";

export async function generateMetadata() {
  const t = await getTranslations("Company");
  return { title: t("title") };
}

export default async function CompanySettingsPage() {
  const t = await getTranslations("Company");
  const company = await getCompany();
  const c = company.completeness;
  const missing = c.items.filter((i) => i.isRequired && !i.isComplete);

  return (
    <div className="space-y-4">
      <div className="rounded-[6px] border border-border bg-surface px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-medium text-ink">{t("title")}</h2>
            <Badge
              variant="outline"
              className={cn(
                "rounded-[4px]",
                c.isReadyToInvoice
                  ? "border-positive/35 text-positive"
                  : "border-border text-muted-foreground",
              )}
            >
              {c.isReadyToInvoice ? t("ready") : t("incomplete")}
            </Badge>
          </div>
          <p className="data-num text-[12px] text-muted-foreground">
            {c.completedRequired}/{c.totalRequired} · {c.percentComplete}%
          </p>
        </div>

        <Progress value={c.percentComplete} className="mt-2.5 h-1" />

        {!c.isReadyToInvoice && missing.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {missing.map((i) => (
              <Badge
                key={i.key}
                variant="secondary"
                className="rounded-[4px] font-normal text-muted-foreground"
              >
                {i.label}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[12px] text-muted-foreground">
            {t("description")}
          </p>
        )}
      </div>

      <CompanyForm initial={company} mode="settings" />
    </div>
  );
}
