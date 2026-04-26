import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: string; email: string; role: string; userType: string;
    tenantId?: string; companyId?: string | null; isSharedTenant?: boolean; isSuperAdmin?: boolean;
    talentId?: string; brandCode?: string; purpose?: string; companyRole?: string; combinedCode?: string;
  }) {
    // Super admin — no User DB lookup needed
    if (payload.isSuperAdmin) {
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role ?? 'PLATFORM_ADMIN',
        userType: payload.userType ?? 'SUPER_ADMIN',
        tenantId: payload.tenantId,
        companyId: payload.companyId ?? null,
        isSharedTenant: payload.isSharedTenant ?? false,
        isSuperAdmin: true,
      };
    }

    // Vendor — no User DB lookup needed (vendors are in marketplaceVendor table)
    if ((payload as any).vendorId || payload.userType === 'VENDOR') {
      return {
        id: payload.sub,
        email: payload.email,
        role: 'VENDOR',
        userType: 'VENDOR',
        vendorId: (payload as any).vendorId ?? payload.sub,
      };
    }

    // Regular user — match by userId only; tenantId may be empty for CUSTOMER (shared-tenant model)
    const user = await this.prisma.identity.user.findFirst({
      where: { id: payload.sub },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        status: true, userType: true, tenantId: true,
        role: { select: { id: true, name: true, displayName: true, level: true } },
        departmentId: true,
        department: { select: { id: true, name: true, path: true } },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Lookup tenant's industry code for cross-cutting filters (skip for shared/empty tenants)
    let businessTypeCode: string | undefined;
    if (user.tenantId) {
      const tenant = await this.prisma.identity.tenant.findUnique({
        where: { id: user.tenantId },
        select: { industryCode: true },
      });
      businessTypeCode = tenant?.industryCode ?? undefined;
    }

    // Shared-tenant users have empty tenant_id in DB; fall back to the
    // tenantId minted at login time (set from the active company's tenant).
    const effectiveTenantId = (user.tenantId && user.tenantId.trim())
      ? user.tenantId
      : (payload.tenantId ?? '');

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      roleId: user.role.id,
      roleLevel: user.role.level,
      userType: user.userType,
      departmentId: user.departmentId,
      departmentPath: user.department?.path,
      tenantId: effectiveTenantId,
      // Person-centric fields (PR #44) — passed through from JWT
      companyId: payload.companyId ?? null,
      isSharedTenant: payload.isSharedTenant ?? !user.tenantId,
      businessTypeCode,
      // Day 2 self-care fields — passed through from JWT
      talentId: payload.talentId ?? null,
      brandCode: payload.brandCode ?? null,
      purpose: payload.purpose ?? null,
      companyRole: payload.companyRole ?? null,
      // M7 — combined_code context for pc_page_access checks
      combinedCode: payload.combinedCode ?? null,
    };
  }
}
