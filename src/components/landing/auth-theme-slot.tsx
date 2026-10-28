"use client";

import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";

export function AuthThemeSlot() {
  return (
    <div className="auth-shell-theme">
      <LandingThemeToggle />
    </div>
  );
}
