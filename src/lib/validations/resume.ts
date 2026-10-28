import { z } from "zod";

export const resumeEntryTypes = [
  "experience",
  "education",
  "certification",
  "language",
  "other",
] as const;

export const resumeEntryTypeLabels: Record<
  (typeof resumeEntryTypes)[number],
  string
> = {
  experience: "Skúsenosť",
  education: "Vzdelanie",
  certification: "Certifikát",
  language: "Jazyk",
  other: "Iné",
};

export const resumeProfileSchema = z.object({
  fullName: z.string().trim().max(200),
  headline: z.string().trim().max(300),
  summary: z.string().trim().max(4000),
  email: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Neplatný e-mail",
    }),
  phone: z.string().trim().max(50),
  location: z.string().trim().max(200),
  website: z.string().trim().max(300),
  skills: z.string().trim().max(2000),
});

export const resumeEntrySchema = z
  .object({
    type: z.enum(resumeEntryTypes),
    title: z.string().trim().min(1, "Názov je povinný").max(200),
    organization: z.string().trim().max(200),
    location: z.string().trim().max(200),
    startDate: z.string(),
    endDate: z.string(),
    isCurrent: z.boolean().default(false),
    description: z.string().trim().max(4000),
    sortOrder: z.coerce.number().int().optional(),
  })
  .superRefine((value, ctx) => {
    if (
      !value.isCurrent &&
      value.startDate &&
      value.endDate &&
      value.endDate < value.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Koniec musí byť po začiatku",
      });
    }
  });

export type ResumeProfileFormValues = z.infer<typeof resumeProfileSchema>;
export type ResumeProfileFormInput = z.input<typeof resumeProfileSchema>;
export type ResumeEntryFormValues = z.infer<typeof resumeEntrySchema>;
export type ResumeEntryFormInput = z.input<typeof resumeEntrySchema>;
