"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { isApiError } from "@/lib/api/errors";
import type { Note, PagedResponse } from "@/lib/api/types";
import { ActionError, actionClient } from "@/lib/safe-action";
import { noteSchema } from "@/lib/validations/notes";

export async function listNotes(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  pinnedOnly?: boolean;
}): Promise<PagedResponse<Note>> {
  return apiFetch<PagedResponse<Note>>("/api/notes", {
    searchParams: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
      search: params?.search,
      pinnedOnly: params?.pinnedOnly,
    },
    next: { tags: ["notes"], revalidate: 15 },
  });
}

function mapApiFieldErrors(error: unknown): never | void {
  if (!isApiError(error)) return;
  const fields = error.fieldErrors();
  if (Object.keys(fields).length === 0) throw error;

  returnValidationErrors(
    noteSchema,
    Object.fromEntries(
      Object.entries(fields).map(([key, message]) => [
        key,
        { _errors: [message] },
      ]),
    ) as never,
  );
}

export const createNoteAction = actionClient
  .inputSchema(noteSchema)
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<Note>("/api/notes", {
        method: "POST",
        body: {
          title: parsedInput.title,
          body: parsedInput.body || "",
          isPinned: parsedInput.isPinned,
        },
      });
      revalidateTag("notes", "max");
      revalidatePath("/notes");
      return data;
    } catch (error) {
      mapApiFieldErrors(error);
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const updateNoteAction = actionClient
  .inputSchema(noteSchema.extend({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const { id, ...body } = parsedInput;
    try {
      const data = await apiFetch<Note>(`/api/notes/${id}`, {
        method: "PUT",
        body: {
          title: body.title,
          body: body.body || "",
          isPinned: body.isPinned,
        },
      });
      revalidateTag("notes", "max");
      revalidatePath("/notes");
      return data;
    } catch (error) {
      mapApiFieldErrors(error);
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const deleteNoteAction = actionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    try {
      await apiFetch<void>(`/api/notes/${parsedInput.id}`, {
        method: "DELETE",
      });
      revalidateTag("notes", "max");
      revalidatePath("/notes");
      return { ok: true };
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
