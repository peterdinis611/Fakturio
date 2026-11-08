"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  align = "left",
}: {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
  align?: "left" | "right";
}) {
  if (!column.getCanSort()) {
    return (
      <span
        className={cn(
          "text-[12px] font-medium text-muted-foreground",
          align === "right" && "block w-full text-right",
          className,
        )}
      >
        {title}
      </span>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className={cn(
        "-ml-2 h-7 gap-1 px-2 text-[12px] font-medium text-muted-foreground hover:text-ink",
        align === "right" && "ml-auto -mr-2 flex",
        className,
      )}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUp className="size-3 opacity-80" aria-hidden />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3 opacity-80" aria-hidden />
      ) : (
        <ArrowUpDown className="size-3 opacity-40" aria-hidden />
      )}
    </Button>
  );
}
