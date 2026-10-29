"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type {
  PagedResponse,
  ResumeEntry,
  ResumeEntryType,
  ResumeProfile,
} from "@/shared/api/types";
import { ActionError, actionClient } from "@/shared/lib/safe-action";
import {
  resumeEntrySchema,
  resumeProfileSchema,
} from "@/entities/resume/model/schema";

export async function getResumeProfile(): Promise<ResumeProfile> {
  return apiFetch<ResumeProfile>("/api/resume", {
    next: { tags: ["resume"], revalidate: 20 },
  });
}

export async function listResumeEntries(params?: {
  page?: number;
  pageSize?: number;
  type?: ResumeEntryType;
  search?: string;
}): Promise<PagedResponse<ResumeEntry>> {
  return apiFetch<PagedResponse<ResumeEntry>>("/api/resume/entries", {
    searchParams: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
      type: params?.type,
      search: params?.search,
    },
    next: { tags: ["resume"], revalidate: 20 },
  });
}

function mapProfileFieldErrors(error: unknown): never | void {
  if (!isApiError(error)) return;
  const fields = error.fieldErrors();
  if (Object.keys(fields).length === 0) throw error;

  returnValidationErrors(
    resumeProfileSchema,
    Object.fromEntries(
      Object.entries(fields).map(([key, message]) => [
        key,
        { _errors: [message] },
      ]),
    ) as never,
  );
}

function mapEntryFieldErrors(error: unknown): never | void {
  if (!isApiError(error)) return;
  const fields = error.fieldErrors();
  if (Object.keys(fields).length === 0) throw error;

  returnValidationErrors(
    resumeEntrySchema,
    Object.fromEntries(
      Object.entries(fields).map(([key, message]) => [
        key,
        { _errors: [message] },
      ]),
    ) as never,
  );
}

function emptyToNull(value: string | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value;
}

export const updateResumeProfileAction = actionClient
  .inputSchema(resumeProfileSchema)
  .action(async ({ parsedInput }) => {
    try {
      const data = await apiFetch<ResumeProfile>("/api/resume", {
        method: "PUT",
        body: parsedInput,
      });
      revalidateTag("resume", "max");
      revalidatePath("/zivotopis");
      return data;
    } catch (error) {
      mapProfileFieldErrors(error);
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const createResumeEntryAction = actionClient
  .inputSchema(resumeEntrySchema)
  .action(async ({ parsedInput }) => {
    const body = {
      ...parsedInput,
      startDate: emptyToNull(parsedInput.startDate),
      endDate: parsedInput.isCurrent
        ? null
        : emptyToNull(parsedInput.endDate),
    };
    try {
      const data = await apiFetch<ResumeEntry>("/api/resume/entries", {
        method: "POST",
        body,
      });
      revalidateTag("resume", "max");
      revalidatePath("/zivotopis");
      return data;
    } catch (error) {
      mapEntryFieldErrors(error);
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

const updateResumeEntrySchema = resumeEntrySchema.safeExtend({
  id: z.string().uuid(),
});

export const updateResumeEntryAction = actionClient
  .inputSchema(updateResumeEntrySchema)
  .action(async ({ parsedInput }) => {
    const { id, ...rest } = parsedInput;
    const body = {
      ...rest,
      startDate: emptyToNull(rest.startDate),
      endDate: rest.isCurrent ? null : emptyToNull(rest.endDate),
    };
    try {
      const data = await apiFetch<ResumeEntry>(`/api/resume/entries/${id}`, {
        method: "PUT",
        body,
      });
      revalidateTag("resume", "max");
      revalidatePath("/zivotopis");
      return data;
    } catch (error) {
      mapEntryFieldErrors(error);
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });

export const deleteResumeEntryAction = actionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    try {
      await apiFetch<void>(`/api/resume/entries/${parsedInput.id}`, {
        method: "DELETE",
      });
      revalidateTag("resume", "max");
      revalidatePath("/zivotopis");
      return { ok: true };
    } catch (error) {
      if (isApiError(error)) throw new ActionError(error.message);
      throw error;
    }
  });
