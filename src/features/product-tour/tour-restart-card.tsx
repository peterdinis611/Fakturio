"use client";

import { Route } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { requestProductTourStart } from "./storage";

export function TourRestartCard() {
  const t = useTranslations("ProductTour");

  return (
    <Card size="sm" className="mt-4 rounded-[6px] bg-surface ring-border">
      <CardHeader className="border-b border-rule pb-3">
        <CardTitle className="text-[15px]">{t("restartTitle")}</CardTitle>
        <CardDescription>{t("restartDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => requestProductTourStart()}
        >
          <Route className="size-4 opacity-70" aria-hidden />
          {t("restartCta")}
        </Button>
      </CardContent>
    </Card>
  );
}
