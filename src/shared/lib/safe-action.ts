import { createSafeActionClient } from "next-safe-action";
import { ApiError, isApiError } from "@/shared/api/errors";
import { logActionFailure } from "@/shared/api/log";
import { toUserFacingError } from "@/shared/lib/user-error";

/** Thrown from actions when the message is safe to show to the user. */
export class ActionError extends Error {
  /** Optional API status/code for server logs (never shown in UI). */
  readonly causeStatus?: number;
  readonly causeCode?: string | null;
  readonly causeDetail?: string | null;

  constructor(
    message: string,
    meta?: {
      status?: number;
      code?: string | null;
      detail?: string | null;
    },
  ) {
    super(toUserFacingError(message, meta?.code));
    this.name = "ActionError";
    this.causeStatus = meta?.status;
    this.causeCode = meta?.code ?? null;
    this.causeDetail = meta?.detail ?? null;
  }

  static fromApi(error: ApiError): ActionError {
    return new ActionError(error.message, {
      status: error.status,
      code: error.problem.code,
      detail: error.problem.detail,
    });
  }
}

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof ActionError) {
      logActionFailure("safe-action", e, {
        status: e.causeStatus ?? null,
        code: e.causeCode ?? null,
        detail: e.causeDetail ?? null,
      });
      return toUserFacingError(e.message, e.causeCode);
    }
    if (isApiError(e)) {
      logActionFailure("safe-action", e);
      return toUserFacingError(e.message, e.problem.code);
    }
    logActionFailure("safe-action", e);
    return toUserFacingError(
      e instanceof Error ? e.message : undefined,
    );
  },
  defaultValidationErrorsShape: "flattened",
});
