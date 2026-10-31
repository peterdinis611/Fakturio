import type { ApiProblem } from "./types";
import { localizeFieldError, toUserFacingError } from "@/shared/lib/user-error";

export class ApiError extends Error {
  status: number;
  problem: ApiProblem;

  constructor(status: number, problem: ApiProblem) {
    super(
      toUserFacingError(
        problem.detail || problem.title || undefined,
        problem.code,
      ),
    );
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }

  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    if (!this.problem.errors) return out;
    for (const [key, messages] of Object.entries(this.problem.errors)) {
      const field = key.charAt(0).toLowerCase() + key.slice(1);
      out[field] = localizeFieldError(messages[0] ?? "Neplatná hodnota");
    }
    return out;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
