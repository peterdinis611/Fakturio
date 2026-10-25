import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
  children,
  className,
  tone = "panel",
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** `panel` = bordered surface; `open` = rule-top, no card chrome */
  tone?: "panel" | "open";
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-start",
        tone === "panel" && "panel gap-4 px-6 py-12",
        tone === "open" && "gap-5 border-t border-rule pt-8",
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden
          className="inline-flex size-11 items-center justify-center rounded-[4px] border border-border bg-raised/40 text-muted-foreground [&_svg]:size-[18px]"
        >
          {icon}
        </span>
      ) : null}
      <div className="space-y-2">
        <h2 className="text-[20px] font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="max-w-md text-[14px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {actionLabel && actionHref ? (
        <Button asChild className="mt-1">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
      {children}
    </div>
  );
}
