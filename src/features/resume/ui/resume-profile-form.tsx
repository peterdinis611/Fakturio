"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "@/shared/toast";
import { updateResumeProfileAction } from "@/features/resume/api/resume";
import type { ResumeProfile } from "@/shared/api/types";
import { actionErrorMessage, toFieldErrors } from "@/shared/lib/action-utils";
import {
  resumeProfileSchema,
  type ResumeProfileFormInput,
  type ResumeProfileFormValues,
} from "@/entities/resume/model/schema";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PhoneInput } from "@/shared/ui/phone-input";
import { Textarea } from "@/shared/ui/textarea";

type Props = {
  initial: ResumeProfile;
};

export function ResumeProfileForm({ initial }: Props) {
  const t = useTranslations("Resume");
  const [pending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResumeProfileFormInput, unknown, ResumeProfileFormValues>({
    resolver: zodResolver(resumeProfileSchema),
    defaultValues: {
      fullName: initial.fullName ?? "",
      headline: initial.headline ?? "",
      summary: initial.summary ?? "",
      email: initial.email ?? "",
      phone: initial.phone ?? "",
      location: initial.location ?? "",
      website: initial.website ?? "",
      skills: initial.skills ?? "",
    },
  });

  function submit(values: ResumeProfileFormValues) {
    startTransition(async () => {
      const result = await updateResumeProfileAction(values);
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Uloženie zlyhalo");
        const fieldErrors = toFieldErrors(result?.validationErrors);
        if (fieldErrors) {
          for (const [key, message] of Object.entries(fieldErrors)) {
            setError(key as keyof ResumeProfileFormValues, { message });
          }
        }
        return;
      }
      toast.success(t("profileSaved"));
    });
  }

  return (
    <form
      className="panel space-y-4 p-5"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Meno</Label>
          <Input id="fullName" disabled={pending} {...register("fullName")} />
          {errors.fullName ? (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="headline">{t("headline")}</Label>
          <Input id="headline" disabled={pending} {...register("headline")} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="summary">{t("summary")}</Label>
        <Textarea
          id="summary"
          rows={4}
          disabled={pending}
          {...register("summary")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            disabled={pending}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Telefón</Label>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <PhoneInput
                id="phone"
                disabled={pending}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Lokalita</Label>
          <Input id="location" disabled={pending} {...register("location")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website">Web</Label>
          <Input id="website" disabled={pending} {...register("website")} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="skills">{t("skills")}</Label>
        <Textarea
          id="skills"
          rows={2}
          placeholder={t("skillsHint")}
          disabled={pending}
          {...register("skills")}
        />
        <p className="text-[12px] text-muted-foreground">{t("skillsHint")}</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {t("saveProfile")}
        </Button>
      </div>
    </form>
  );
}
