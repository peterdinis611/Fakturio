/** Shared register password policy (FE + messages). */
export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRuleId =
  | "minLength"
  | "upper"
  | "lower"
  | "special";

export type PasswordRuleState = {
  id: PasswordRuleId;
  ok: boolean;
};

const UPPER = /[A-ZÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]/u;
const LOWER = /[a-záäčďéíĺľňóôŕšťúýž]/u;
const SPECIAL = /[^A-Za-zÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽáäčďéíĺľňóôŕšťúýž0-9]/u;

export function evaluatePasswordRules(password: string): PasswordRuleState[] {
  return [
    { id: "minLength", ok: password.length >= PASSWORD_MIN_LENGTH },
    { id: "upper", ok: UPPER.test(password) },
    { id: "lower", ok: LOWER.test(password) },
    { id: "special", ok: SPECIAL.test(password) },
  ];
}

export function passwordMeetsPolicy(password: string): boolean {
  return evaluatePasswordRules(password).every((r) => r.ok);
}
