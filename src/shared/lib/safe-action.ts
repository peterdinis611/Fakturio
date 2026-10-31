import { createSafeActionClient } from "next-safe-action";
import { isApiError } from "@/shared/api/errors";
import { toUserFacingError } from "@/shared/lib/user-error";

/** Thrown from actions when the message is safe to show to the user. */
export class ActionError extends Error {
  constructor(message: string) {
    super(toUserFacingError(message));
    this.name = "ActionError";
  }
}

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof ActionError) return toUserFacingError(e.message);
    if (isApiError(e)) {
      return toUserFacingError(e.message, e.problem.code);
    }
    console.error("[safe-action]", e);
    return toUserFacingError(
      e instanceof Error ? e.message : undefined,
    );
  },
  defaultValidationErrorsShape: "flattened",
});
