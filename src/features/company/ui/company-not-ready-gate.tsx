import { Building2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/shared/ui/empty-state";

/** Hard stop when company profile is incomplete for invoicing. */
export async function CompanyNotReadyGate({
  descriptionKey = "notReadyBody",
}: {
  descriptionKey?: "notReadyBody" | "notReadyRecurringBody";
} = {}) {
  const t = await getTranslations("Company");

  return (
    <EmptyState
      icon={<Building2 />}
      title={t("notReadyTitle")}
      description={t(descriptionKey)}
      actionLabel={t("notReadyCta")}
      actionHref="/settings/company"
    />
  );
}
