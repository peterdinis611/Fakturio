import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="panel flex flex-col items-start gap-2 px-5 py-8">
      <h2 className="text-[16px] font-medium text-ink">{title}</h2>
      <p className="max-w-md text-[14px] text-muted-foreground">{description}</p>
      {actionLabel && actionHref ? (
        <Button asChild className="mt-3">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
