"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { updateUserAction } from "@/features/auth/api/users";
import { actionErrorMessage, toFieldErrors } from "@/shared/lib/action-utils";
import { toast } from "@/shared/toast";
import type { AppUser } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const schema = z.object({
  firstName: z.string().trim().max(100),
  lastName: z.string().trim().max(100),
});

type Values = z.infer<typeof schema>;

type Props = {
  user: AppUser;
};

export function ProfileAccountForm({ user }: Props) {
  const t = useTranslations("Profile");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    },
  });

  function onSubmit(values: Values) {
    startTransition(async () => {
      const result = await updateUserAction({
        id: user.id,
        firstName: values.firstName || null,
        lastName: values.lastName || null,
      });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? t("accountSaveFailed"));
        const fields = toFieldErrors(result?.validationErrors);
        if (fields) {
          for (const [key, message] of Object.entries(fields)) {
            setError(key as keyof Values, { message });
          }
        }
        return;
      }
      toast.success(t("accountSaved"));
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-firstName">{t("firstName")}</Label>
          <Input
            id="profile-firstName"
            autoComplete="given-name"
            {...register("firstName")}
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName ? (
            <p className="text-[12px] text-negative">{errors.firstName.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-lastName">{t("lastName")}</Label>
          <Input
            id="profile-lastName"
            autoComplete="family-name"
            {...register("lastName")}
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName ? (
            <p className="text-[12px] text-negative">{errors.lastName.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-email">{t("email")}</Label>
        <Input
          id="profile-email"
          value={user.email}
          readOnly
          disabled
          className="opacity-80"
        />
        <p className="text-[11px] text-muted-foreground">{t("emailLocked")}</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending || !isDirty}>
          {pending ? `${t("saveAccount")}…` : t("saveAccount")}
        </Button>
      </div>
    </form>
  );
}
