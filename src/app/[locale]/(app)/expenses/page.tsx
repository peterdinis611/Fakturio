import { getTranslations } from "next-intl/server";
import { DocumentsCatalog } from "@/features/invoices/ui/documents-catalog";

export async function generateMetadata() {
  const t = await getTranslations("Documents");
  return { title: t("expenses") };
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    type?: string;
    q?: string;
    overdue?: string;
  }>;
}) {
  const sp = await searchParams;
  return <DocumentsCatalog flow="Received" searchParams={sp} />;
}
