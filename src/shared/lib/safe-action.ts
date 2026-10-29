import { createSafeActionClient } from "next-safe-action";
import { isApiError } from "@/shared/api/errors";

/** Thrown from actions when the message is safe to show to the user. */
export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof ActionError) return e.message;
    if (isApiError(e)) return e.message;
    console.error("[safe-action]", e);
    return "Niečo sa pokazilo. Skús znova.";
  },
  defaultValidationErrorsShape: "flattened",
});
