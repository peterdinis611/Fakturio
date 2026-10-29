"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { loginAction, registerAction } from "@/actions/auth";
import { actionErrorMessage } from "@/lib/action-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result =
        mode === "sign-in"
          ? await loginAction({ email, password })
          : await registerAction({
              email,
              password,
              firstName,
              lastName,
            });

      if (!result?.data) {
        const message =
          actionErrorMessage(result ?? {}) ?? t("authFailed");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(mode === "sign-in" ? t("signedIn") : t("registered"));
      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      {mode === "sign-up" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="firstName">{t("firstName")}</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              disabled={pending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lastName">{t("lastName")}</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              disabled={pending}
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("password")}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "sign-in" ? "current-password" : "new-password"
            }
            required
            minLength={mode === "sign-up" ? 8 : 1}
            disabled={pending}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={pending}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-ink disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner size="sm" label={t("submitting")} />
            {t("submitting")}
          </span>
        ) : mode === "sign-in" ? (
          t("signInSubmit")
        ) : (
          t("signUpSubmit")
        )}
      </Button>
    </form>
  );
}
