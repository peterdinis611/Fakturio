import { cn } from "@/shared/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

type Props = {
  index: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
};

export function ProfileSection({
  index,
  title,
  description,
  children,
  className,
  footer,
}: Props) {
  return (
    <Card
      size="sm"
      className={cn(
        "overflow-hidden rounded-[6px] border-border bg-surface shadow-none ring-1 ring-border",
        className,
      )}
    >
      <CardHeader className="border-b border-rule bg-raised/25">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-[13px] font-semibold tracking-[0.06em] uppercase">
              {title}
            </CardTitle>
            {description ? (
              <CardDescription className="mt-1">{description}</CardDescription>
            ) : null}
          </div>
          <Badge
            variant="outline"
            className="rounded-[4px] font-mono text-[10px] tracking-wider"
          >
            {index}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
      {footer}
    </Card>
  );
}
