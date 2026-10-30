import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().trim().min(1, "Názov je povinný").max(200),
  body: z.string().trim().max(16000).optional().or(z.literal("")),
  isPinned: z.boolean().default(false),
});

export type NoteFormValues = z.infer<typeof noteSchema>;
export type NoteFormInput = z.input<typeof noteSchema>;
