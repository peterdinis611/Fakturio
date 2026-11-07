import { getTranslations } from "next-intl/server";
import {
  DocumentsCatalog,
  loadDocumentsCatalog,
} from "@/features/invoices/ui/documents-catalog";

export async function generateMetadata() {
  const t = await getTranslations("Invoices");
  return { title: t("title") };
}

export default async function InvoicesPage({
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
  const dataPromise = loadDocumentsCatalog("Issued", sp);
  return (
    <DocumentsCatalog
      flow="Issued"
      searchParams={sp}
      dataPromise={dataPromise}
    />
  );
}
