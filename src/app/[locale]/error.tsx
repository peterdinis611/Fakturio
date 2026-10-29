"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/shared/ui/error-screen";
import { Button } from "@/shared/ui/button";

export default function ErrorPage({
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
      title="Niečo sa pokazilo"
      description="Nepodarilo sa načítať túto stránku. Skús to znova — ak problém pretrváva, reštartuj aplikáciu."
      secondary={
        <Button type="button" variant="outline" onClick={reset}>
          Skúsiť znova
        </Button>
      }
    />
  );
}
