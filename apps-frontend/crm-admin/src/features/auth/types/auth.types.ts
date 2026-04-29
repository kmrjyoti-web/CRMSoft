// ── User ────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  role: string;
  roleDisplayName?: string;
  talentId?: string;
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
  // Person-centric fields (Day 1)
  talentId?: string;
  brandCode?: string;
  companyId?: string;
  purpose?: string;
  exp: number;
  iat: number;
}

// ── Auth Request / Response ─────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginPortal = "admin" | "employee" | "customer" | "partner" | "super-admin";

// Company entry returned by /auth/login and /auth/me/companies
export interface CompanyListItem {
  id: string;
  talentId: string;
  name: string;
  brandCode: string | null;
  brandName: string | null;
  logoUrl: string | null;
  verticalCode: string | null;
  categoryCode: string | null;
  role: string;
  isDefault: boolean;
  status: string;
  lastAccessedAt: string | null;
  domain: string | null;
  subdomain: string | null;
  isCrossBrand: boolean;
}

export type SwitchCompanyResult =
  | {
      crossBrand: false;
      activeCompanyId: string;
      activeCompanyBrandCode: string | null;
      accessToken: string;
      refreshToken: string;
    }
  | {
      crossBrand: true;
      activeCompanyId: string;
      activeCompanyBrandCode: string | null;
      ssoToken: string;
      redirectUrl: string;
    };

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tenantCode?: string;
  // Universal endpoint fields (Day 1 — Person-Centric Identity)
  companies?: CompanyListItem[];
  activeCompanyId?: string | null;
  activeCompanyBrandCode?: string | null;
  requiresCompanySelection?: boolean;
  hasCompanies?: boolean;
  companyCount?: number;
  redirectPath?: string;
}
