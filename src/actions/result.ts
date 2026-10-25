import { isApiError } from "@/lib/api/errors";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(
  message: string,
  fieldErrors?: Record<string, string>,
): ActionResult<never> {
  return { ok: false, message, fieldErrors };
}

export function fromUnknown(error: unknown): ActionResult<never> {
  if (isApiError(error)) {
    return fail(error.message, error.fieldErrors());
  }
  if (error instanceof Error) {
    return fail(error.message);
  }
  return fail("Neznáma chyba");
}
