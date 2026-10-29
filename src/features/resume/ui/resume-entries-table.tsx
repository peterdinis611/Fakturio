"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "@/shared/toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteResumeEntryAction } from "@/features/resume/api/resume";
import { ResumeEntryForm } from "@/features/resume/ui/resume-entry-form";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import type { ResumeEntry } from "@/shared/api/types";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { resumeEntryTypeLabels } from "@/entities/resume/model/schema";

type Props = {
  items: ResumeEntry[];
};

function formatPeriod(entry: ResumeEntry): string {
  const start = entry.startDate ?? "—";
  if (entry.isCurrent) return `${start} – teraz`;
  const end = entry.endDate ?? "—";
  return `${start} – ${end}`;
}

export function ResumeEntriesTable({ items }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<ResumeEntry | null>(null);

  function refresh() {
    router.refresh();
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteResumeEntryAction({ id });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Mazanie zlyhalo");
        return;
      }
      toast.success("Položka odstránená");
      refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-medium text-ink">Položky</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button type="button">
              <Plus className="size-4" aria-hidden />
              Nová položka
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nová položka</DialogTitle>
            </DialogHeader>
            <ResumeEntryForm
              onDone={() => {
                setCreateOpen(false);
                refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Zatiaľ bez položiek"
          description="Pridaj skúsenosti, vzdelanie alebo certifikáty."
        />
      ) : (
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[12px] text-muted-foreground">
                  Typ
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  Názov
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  Organizácia
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  Obdobie
                </TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="h-11">
                  <TableCell className="text-muted-foreground">
                    {resumeEntryTypeLabels[item.type] ?? item.type}
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.organization || "—"}</TableCell>
                  <TableCell className="data-num text-[13px] text-muted-foreground">
                    {formatPeriod(item)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={pending}
                        aria-label="Upraviť"
                        onClick={() => setEditItem(item)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={pending}
                        aria-label="Zmazať"
                        onClick={() => remove(item.id)}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={Boolean(editItem)}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upraviť položku</DialogTitle>
          </DialogHeader>
          {editItem ? (
            <ResumeEntryForm
              key={editItem.id}
              initial={editItem}
              onDone={() => {
                setEditItem(null);
                refresh();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
