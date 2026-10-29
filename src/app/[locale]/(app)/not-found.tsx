import Link from "next/link";
import { ErrorScreen } from "@/shared/ui/error-screen";
import { Button } from "@/shared/ui/button";

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
