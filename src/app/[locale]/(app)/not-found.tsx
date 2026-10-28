import Link from "next/link";
import { ErrorScreen } from "@/components/shared/error-screen";
import { Button } from "@/components/ui/button";

export default function AppNotFoundPage() {
  return (
    <ErrorScreen
      code="404"
      title="Nenašli sme to"
      description="Faktúra, zákazník alebo stránka neexistuje. Možno bola zmazaná, alebo máš starý odkaz."
      secondary={
        <Button asChild variant="outline">
          <Link href="/search">Hľadať</Link>
        </Button>
      }
    />
  );
}
