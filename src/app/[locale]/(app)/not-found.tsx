import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ErrorScreen } from "@/shared/ui/error-screen";
import { Button } from "@/shared/ui/button";

export default async function AppNotFoundPage() {
  const t = await getTranslations("Errors");

  return (
    <ErrorScreen
      code="404"
      title={t("notFoundTitle")}
      description={t("notFoundBody")}
      secondary={
        <Button asChild variant="outline">
          <Link href="/search">{t("search")}</Link>
        </Button>
      }
    />
  );
}
