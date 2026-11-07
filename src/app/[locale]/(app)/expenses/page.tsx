import { getTranslations } from "next-intl/server";
import {
  DocumentsCatalog,
  loadDocumentsCatalog,
} from "@/features/invoices/ui/documents-catalog";

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
  const dataPromise = loadDocumentsCatalog("Received", sp);
  return (
    <DocumentsCatalog
      flow="Received"
      searchParams={sp}
      dataPromise={dataPromise}
    />
  );
}
