"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { deleteNoteAction } from "@/actions/notes";
import { NoteForm } from "@/components/notes/note-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Note } from "@/lib/api/types";
import { actionErrorMessage } from "@/lib/action-utils";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  items: Note[];
};

export function NotesBoard({ items }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Note | null>(null);

  function refresh() {
    router.refresh();
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteNoteAction({ id });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Mazanie zlyhalo");
        return;
      }
      toast.success("Poznámka odstránená");
      refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button type="button">
              <Plus className="size-4" aria-hidden />
              Nová poznámka
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nová poznámka</DialogTitle>
            </DialogHeader>
            <NoteForm
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
          title="Zatiaľ žiadne poznámky"
          description="Zapíš si quick poznámky k zákazníkom, DPH alebo todočekám."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((note) => (
            <Card
              key={note.id}
              size="sm"
              className={cn(
                "rounded-[6px] bg-surface ring-border",
                note.isPinned && "ring-ink/20",
              )}
            >
              <CardHeader className="border-b border-rule pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-[14px]">
                    {note.title}
                  </CardTitle>
                  {note.isPinned ? (
                    <Badge
                      variant="outline"
                      className="shrink-0 rounded-[4px] gap-1 text-[10px]"
                    >
                      <Pin className="size-3" aria-hidden />
                      Pin
                    </Badge>
                  ) : null}
                </div>
                <CardDescription className="data-num text-[11px]">
                  {formatDateTime(note.updatedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="line-clamp-5 whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                  {note.body?.trim() ? note.body : "—"}
                </p>
              </CardContent>
              <CardFooter className="justify-end gap-1 border-t border-rule bg-raised/20">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  disabled={pending}
                  aria-label="Upraviť"
                  onClick={() => setEditItem(note)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  disabled={pending}
                  aria-label="Zmazať"
                  onClick={() => remove(note.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
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
            <DialogTitle>Upraviť poznámku</DialogTitle>
          </DialogHeader>
          {editItem ? (
            <NoteForm
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
