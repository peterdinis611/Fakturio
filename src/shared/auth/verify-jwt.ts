import { jwtVerify } from "jose";

const DEFAULT_ISSUER = "fakturio";
const DEFAULT_AUDIENCE = "fakturio";

export type VerifiedAccessToken = {
  sub: string;
  exp: number;
};

function jwtSecret(): Uint8Array | null {
  const key = process.env.JWT_KEY?.trim();
  if (!key || key.length < 32) return null;
  return new TextEncoder().encode(key);
}

/**
 * Verify session JWT signature + expiry (same key/issuer/audience as the API).
 * Edge-safe (jose + Uint8Array). Returns null when invalid.
 * When JWT_KEY is unset outside production, falls back to an unverified presence check
 * so local dev still works before the secret is wired into frontend/.env.
 */
export async function verifyAccessToken(
  token: string | null | undefined,
): Promise<VerifiedAccessToken | null> {
  if (!token?.trim()) return null;

  const secret = jwtSecret();
  if (!secret) {
    if (process.env.NODE_ENV === "production") return null;
    return { sub: "dev-unverified", exp: Math.floor(Date.now() / 1000) + 3600 };
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: process.env.JWT_ISSUER?.trim() || DEFAULT_ISSUER,
      audience: process.env.JWT_AUDIENCE?.trim() || DEFAULT_AUDIENCE,
      clockTolerance: 60,
    });

    const sub =
      typeof payload.sub === "string"
        ? payload.sub
        : typeof payload.nameid === "string"
          ? payload.nameid
          : null;
    const exp = typeof payload.exp === "number" ? payload.exp : null;
    if (!sub || exp === null) return null;

    // Hub tokens must not unlock the app session cookie.
    if (payload.tok === "hub") return null;

    return { sub, exp };
  } catch {
    return null;
  }
}

export async function isValidAccessToken(
  token: string | null | undefined,
): Promise<boolean> {
  return (await verifyAccessToken(token)) !== null;
}
