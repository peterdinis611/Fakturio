import { flattenValidationErrors } from "next-safe-action";
import { localizeFieldError, toUserFacingError } from "@/shared/lib/user-error";

type FlatErrors = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
};

function isFlat(ve: unknown): ve is FlatErrors {
  return (
    typeof ve === "object" &&
    ve !== null &&
    ("fieldErrors" in ve || "formErrors" in ve)
  );
}

/** Map next-safe-action validation errors into react-hook-form field map. */
export function toFieldErrors(
  validationErrors: unknown,
): Record<string, string> | undefined {
  if (!validationErrors) return undefined;

  const flat: FlatErrors = isFlat(validationErrors)
    ? validationErrors
    : flattenValidationErrors(validationErrors as never);

  const out: Record<string, string> = {};

  for (const [key, messages] of Object.entries(flat.fieldErrors ?? {})) {
    if (messages?.[0]) out[key] = localizeFieldError(messages[0]);
  }

  if (flat.formErrors?.[0] && !out.form) {
    out.form = localizeFieldError(flat.formErrors[0]);
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

export function actionErrorMessage(result: {
  serverError?: string;
  validationErrors?: unknown;
}): string | undefined {
  if (result.serverError) return toUserFacingError(result.serverError);
  const fields = toFieldErrors(result.validationErrors);
  if (fields?.form) return fields.form;
  if (fields && Object.keys(fields).length > 0) return "Skontroluj formulár";
  return undefined;
}
