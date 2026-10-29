"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import { createNoteAction, updateNoteAction } from "@/actions/notes";
import type { Note } from "@/lib/api/types";
import { actionErrorMessage, toFieldErrors } from "@/lib/action-utils";
import {
  noteSchema,
  type NoteFormInput,
  type NoteFormValues,
} from "@/lib/validations/notes";
import { RichTextEditor } from "@/components/notes/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
  initial?: Note | null;
  onDone?: () => void;
};

export function NoteForm({ initial, onDone }: Props) {
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initial?.id);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<NoteFormInput, unknown, NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: initial?.title ?? "",
      body: initial?.body ?? "",
      isPinned: initial?.isPinned ?? false,
    },
  });

  function submit(values: NoteFormValues) {
    startTransition(async () => {
      const result = isEdit
        ? await updateNoteAction({ ...values, id: initial!.id })
        : await createNoteAction(values);

      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Uloženie zlyhalo");
        const fieldErrors = toFieldErrors(result?.validationErrors);
        if (fieldErrors) {
          for (const [key, message] of Object.entries(fieldErrors)) {
            setError(key as keyof NoteFormValues, { message });
          }
        }
        return;
      }

      toast.success(isEdit ? "Poznámka upravená" : "Poznámka pridaná");
      onDone?.();
    });
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Názov</Label>
        <Input id="title" disabled={pending} {...register("title")} />
        {errors.title ? (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="body">Text</Label>
        <Controller
          control={control}
          name="body"
          render={({ field }) => (
            <RichTextEditor
              id="body"
              value={field.value ?? ""}
              onChange={field.onChange}
              disabled={pending}
              placeholder="Čo si treba zapamätať…"
            />
          )}
        />
        {errors.body ? (
          <p className="text-xs text-destructive">{errors.body.message}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[4px] border border-border bg-raised/40 px-3 py-2.5">
        <div>
          <Label htmlFor="isPinned" className="font-normal">
            Pripnúť hore
          </Label>
          <p className="text-[12px] text-muted-foreground">
            Pripnuté poznámky sú vždy prvé.
          </p>
        </div>
        <Controller
          control={control}
          name="isPinned"
          render={({ field }) => (
            <Switch
              id="isPinned"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={pending}
            />
          )}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {isEdit ? "Uložiť" : "Pridať"}
        </Button>
      </div>
    </form>
  );
}
