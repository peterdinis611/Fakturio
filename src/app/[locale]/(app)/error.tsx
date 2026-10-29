"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/shared/ui/error-screen";
import { Button } from "@/shared/ui/button";

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code="500"
      title="Chyba pri načítaní"
      description="Túto časť aplikácie sa nepodarilo zobraziť. Skús znova alebo prejdi na prehľad."
      secondary={
        <Button type="button" variant="outline" onClick={reset}>
          Skúsiť znova
        </Button>
      }
    />
  );
}
