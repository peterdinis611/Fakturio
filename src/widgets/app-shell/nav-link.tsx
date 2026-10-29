"use client";

import { useLinkStatus } from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";

type Props = ComponentProps<typeof Link> & {
  children: ReactNode;
  active?: boolean;
};

function PendingCue() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      aria-hidden
      className="absolute inset-y-1.5 right-2 w-1 animate-pulse rounded-full bg-ink/40"
    />
  );
}

/** Locale-aware link with prefetch + pending cue while the RSC route loads. */
export function NavLink({
  children,
  className,
  active,
  prefetch = true,
  ...props
}: Props) {
  return (
    <Link
      {...props}
      prefetch={prefetch}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative transition-opacity duration-150",
        className,
      )}
    >
      {children}
      <PendingCue />
    </Link>
  );
}
