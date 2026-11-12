"use client";

import { useState, useTransition } from "react";
import { Copy, Link2 } from "lucide-react";
import { useLocale } from "next-intl";
import { toast } from "@/shared/toast";
import { setInvoicePublicLinkAction } from "@/features/invoices/api/public";
import type { PublicLink } from "@/shared/api/types";
import type { InvoiceStatus } from "@/shared/api/types";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { cn } from "@/shared/lib/utils";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  invoiceId: string;
  invoiceStatus: InvoiceStatus;
  initial: PublicLink;
};

export function InvoicePublicLink({ invoiceId, invoiceStatus, initial }: Props) {
  const locale = useLocale() as AppLocale;
  const [pending, startTransition] = useTransition();
  const [link, setLink] = useState(initial);

  const canEnable =
    invoiceStatus !== "Draft" && invoiceStatus !== "Cancelled";

  function publicUrl(): string | null {
    if (!link.enabled || !link.token) return null;
    if (typeof window === "undefined") return null;
    return `${window.location.origin}/${locale}/p/${link.token}`;
  }

  function toggle(enabled: boolean) {
    startTransition(async () => {
      const result = await setInvoicePublicLinkAction({ id: invoiceId, enabled });
      if (!result?.data) {
        toast.error(
          actionErrorMessage(result ?? {}) ?? "Verejný odkaz sa nepodarilo uložiť",
        );
        return;
      }
      setLink(result.data);
      toast.success(enabled ? "Verejný odkaz je zapnutý" : "Verejný odkaz je vypnutý");
    });
  }

  async function copyUrl() {
    const url = publicUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Odkaz skopírovaný");
    } catch {
      toast.error("Kopírovanie zlyhalo");
    }
  }

  if (!canEnable) return null;

  return (
    <div className="panel space-y-3 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link2 aria-hidden className="size-4 text-muted-foreground" />
            <h2 className="text-[14px] font-medium text-ink">Verejný odkaz</h2>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Zákazník môže zobraziť doklad a stiahnuť PDF bez prihlásenia.
          </p>
        </div>
        <CardToggle
          id="public-link"
          checked={link.enabled}
          disabled={pending}
          onCheckedChange={toggle}
        />
      </div>
      {link.enabled && link.token ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-rule pt-3">
          <code
            className={cn(
              "data-num min-w-0 flex-1 truncate rounded-[4px] bg-raised px-2 py-1.5 text-[12px]",
            )}
          >
            {publicUrl() ?? `/${locale}${link.publicPath ?? `/p/${link.token}`}`}
          </code>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={copyUrl}
          >
            <Copy className="size-3.5" aria-hidden />
            Kopírovať
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function CardToggle({
  id,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor={id} className="sr-only">
        Zapnúť verejný odkaz
      </Label>
    </div>
  );
}
