import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ErrorScreen } from "@/shared/ui/error-screen";
import { Button } from "@/shared/ui/button";

export async function generateMetadata() {
  return { title: "404" };
}

export default async function NotFoundPage() {
  const t = await getTranslations("Errors");

  return (
    <ErrorScreen
      code="404"
      title={t("pageMissingTitle")}
      description={t("pageMissingBody")}
      secondary={
        <Button asChild variant="outline">
          <Link href="/invoices">{t("invoices")}</Link>
        </Button>
      }
    />
  );
}
