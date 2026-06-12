import { jwtDecode } from "jwt-decode";

import type { JwtPayload } from "@/features/auth/types/auth.types";

/**
 * Decode a JWT and return a typed payload.
 * Returns `null` if the token is invalid or cannot be parsed.
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}
