import { AlertTriangleIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { CompanyCompleteness } from "@/shared/api/types";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Link } from "@/i18n/navigation";

export async function CompanyBanner({
  status,
}: {
  status: CompanyCompleteness;
}) {
  if (status.isReadyToInvoice) return null;

  const t = await getTranslations("Dashboard");

  const missing = status.items
    .filter((i) => i.isRequired && !i.isComplete)
    .map((i) => i.label)
    .slice(0, 3);

  return (
    <div className="border-b border-border px-4 py-2.5 sm:px-6 lg:px-8">
      <Alert className="border-warning/30 bg-pill-warning-bg text-pill-warning-ink">
        <AlertTriangleIcon />
        <AlertTitle className="flex flex-wrap items-center gap-2">
          {t("companyBanner")}
          <Badge
            variant="outline"
            className="rounded-[4px] border-current/30 data-num"
          >
            {status.percentComplete}%
          </Badge>
        </AlertTitle>
        <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
          <span>
            Chýba: {missing.join(", ") || "povinné údaje"}. Doplníš to vo Firma.
          </span>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/settings/company">{t("companyBannerCta")}</Link>
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
