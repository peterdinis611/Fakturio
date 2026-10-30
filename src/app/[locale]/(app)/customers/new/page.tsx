import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { CustomerForm } from "@/features/customers/ui/customer-form";

export async function generateMetadata() {
  const t = await getTranslations("CustomerDetail");
  return { title: t("newTitle") };
}

export default async function NewCustomerPage() {
  const t = await getTranslations("CustomerDetail");

  return (
    <div>
      <PageHeader
        title={t("newTitle")}
        description={t("newDescription")}
      />
      <CustomerForm />
    </div>
  );
}
