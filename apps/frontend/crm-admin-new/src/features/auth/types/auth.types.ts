// ── User ────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  role: string;
  roleDisplayName?: string;
}

// ── JWT ─────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  userType: string;
  tenantId?: string;
  tenantCode?: string;
  isSuperAdmin?: boolean;
  exp: number;
  iat: number;
}

// ── Auth Request / Response ─────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginPortal = "admin" | "employee" | "customer" | "partner" | "super-admin";

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tenantCode?: string;
}
