"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { normalizeAddressAction } from "@/features/integrations/api/integrations";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  query: string;
  country?: string | null;
  onNormalized: (data: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  }) => void;
};

export function AddressNormalizeButton({
  query,
  country = "SK",
  onNormalized,
}: Props) {
  const t = useTranslations("Registry");
  const [pending, startTransition] = useTransition();

  function run() {
    const q = query.trim();
    if (q.length < 3) {
      toast.error(t("addressNeedQuery"));
      return;
    }
    startTransition(async () => {
      const result = await normalizeAddressAction({
        q,
        country: (country || "SK").toUpperCase(),
      });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("addressFailed"));
        return;
      }
      onNormalized({
        street: result.data.street ?? undefined,
        city: result.data.city ?? undefined,
        postalCode: result.data.postalCode ?? undefined,
        country: result.data.countryCode ?? undefined,
      });
      toast.success(t("addressFilled"));
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 shrink-0 px-2.5 text-[12px]"
      disabled={pending || query.trim().length < 3}
      onClick={run}
    >
      {pending ? (
        <Spinner size="sm" label={t("addressChecking")} />
      ) : (
        t("addressNormalize")
      )}
    </Button>
  );
}
