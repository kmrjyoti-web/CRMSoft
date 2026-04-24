export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  userType: string;
  tenantId?: string;
  isSuperAdmin?: boolean;
  vendorId?: string;
  iat?: number;
  exp?: number;
}
