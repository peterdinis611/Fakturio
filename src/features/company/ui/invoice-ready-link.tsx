"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";

type Props = {
  href: string;
  children: ReactNode;
  ready: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  className?: string;
};

/** Invoice CTA that becomes a disabled control when the company is incomplete. */
export function InvoiceReadyLink({
  href,
  children,
  ready,
  variant = "default",
  size = "default",
  className,
}: Props) {
  const t = useTranslations("Company");

  if (ready) {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={className}
      title={t("notReadyTooltip")}
    >
      <Link href="/settings/company">{children}</Link>
    </Button>
  );
}
