import Link from "next/link";
import { ErrorScreen } from "@/components/shared/error-screen";
import { Button } from "@/components/ui/button";

export const metadata = { title: "404" };

export default function NotFoundPage() {
  return (
    <ErrorScreen
      code="404"
      title="Stránka neexistuje"
      description="Táto adresa vo Fakturio nie je. Skontroluj URL alebo sa vráť na prehľad."
      secondary={
        <Button asChild variant="outline">
          <Link href="/invoices">Faktúry</Link>
        </Button>
      }
    />
  );
}
