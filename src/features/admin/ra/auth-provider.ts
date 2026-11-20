import type { AuthProvider } from "react-admin";

/**
 * Session is owned by the Next.js admin layout (`isAdmin` gate).
 * This provider keeps react-admin requireAuth=true honest: check cookie session
 * via /api/auth/me and refuse non-admins.
 */
export const adminAuthProvider: AuthProvider = {
  async login() {
    return Promise.resolve();
  },
  async logout() {
    return Promise.resolve();
  },
  async checkAuth() {
    const res = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!res.ok) throw new Error("Not authenticated");
    const user = (await res.json()) as { isAdmin?: boolean };
    if (!user?.isAdmin) throw new Error("Not an admin");
  },
  async checkError(error: { status?: number }) {
    if (error?.status === 401 || error?.status === 403) {
      throw new Error("Unauthorized");
    }
  },
  async getPermissions() {
    return "admin";
  },
  async getIdentity() {
    const res = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!res.ok) throw new Error("Not authenticated");
    const user = (await res.json()) as {
      id?: string;
      email?: string;
      firstName?: string | null;
      lastName?: string | null;
    };
    return {
      id: user.id ?? "admin",
      fullName:
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.email ||
        "Admin",
    };
  },
};
