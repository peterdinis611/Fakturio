"use client";

import { useState, useTransition } from "react";
import { Pin, Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "@/shared/toast";
import { deleteNoteAction } from "@/features/notes/api/notes";
import { NoteForm } from "@/features/notes/ui/note-form";
import {
  isRichNoteBody,
  noteBodyPlain,
} from "@/features/notes/ui/rich-text-editor";
import { EmptyState } from "@/shared/ui/empty-state";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import type { Note } from "@/shared/api/types";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { formatDateTime } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  items: Note[];
};

export function NotesBoard({ items }: Props) {
  const t = useTranslations("Notes");
  const locale = useLocale() as AppLocale;
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
        toast.error(actionErrorMessage(result ?? {}) ?? t("delete"));
        return;
      }
      toast.success(t("deleted"));
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
              {t("new")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("new")}</DialogTitle>
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
        <EmptyState title={t("empty")} description={t("emptyBody")} />
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
                      {t("pin")}
                    </Badge>
                  ) : null}
                </div>
                <CardDescription className="data-num text-[11px]">
                  {formatDateTime(note.updatedAt, locale)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                {noteBodyPlain(note.body) ? (
                  isRichNoteBody(note.body) ? (
                    <div
                      className="note-body note-body--clamp text-[13px] leading-relaxed text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: note.body }}
                    />
                  ) : (
                    <p className="line-clamp-5 whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                      {note.body}
                    </p>
                  )
                ) : (
                  <p className="text-[13px] text-muted-foreground">—</p>
                )}
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
                  aria-label={t("delete")}
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editItem?.title ?? t("title")}</DialogTitle>
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
