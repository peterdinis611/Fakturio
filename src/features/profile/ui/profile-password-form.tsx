"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { changePasswordAction } from "@/features/auth/api/users";
import { actionErrorMessage, toFieldErrors } from "@/shared/lib/action-utils";
import { toast } from "@/shared/toast";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "mismatch",
  });

type Values = z.infer<typeof schema>;

type Props = {
  userId: string;
};

export function ProfilePasswordForm({ userId }: Props) {
  const t = useTranslations("Profile");
  const tAuth = useTranslations("Auth");
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: Values) {
    startTransition(async () => {
      const result = await changePasswordAction({
        id: userId,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (!result?.data) {
        toast.error(
          actionErrorMessage(result ?? {}) ?? t("passwordSaveFailed"),
        );
        const fields = toFieldErrors(result?.validationErrors);
        if (fields) {
          for (const [key, message] of Object.entries(fields)) {
            setError(key as keyof Values, { message });
          }
        }
        return;
      }
      toast.success(t("passwordSaved"));
      reset();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
          aria-invalid={!!errors.currentPassword}
        />
        {errors.currentPassword ? (
          <p className="text-[12px] text-negative">
            {errors.currentPassword.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword">{t("newPassword")}</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
            aria-invalid={!!errors.newPassword}
          />
          {errors.newPassword ? (
            <p className="text-[12px] text-negative">{tAuth("passwordWeak")}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              {tAuth("passwordRuleMin")} · {tAuth("passwordRuleUpper")} ·{" "}
              {tAuth("passwordRuleSpecial")}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword ? (
            <p className="text-[12px] text-negative">{t("passwordMismatch")}</p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? `${t("changePassword")}…` : t("changePassword")}
        </Button>
      </div>
    </form>
  );
}
