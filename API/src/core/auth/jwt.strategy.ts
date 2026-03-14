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
    tenantId?: string; isSuperAdmin?: boolean;
  }) {
    // Super admin — no User DB lookup needed
    if (payload.isSuperAdmin) {
      return {
        id: payload.sub,
        email: payload.email,
        role: 'PLATFORM_ADMIN',
        userType: 'SUPER_ADMIN',
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

    // Regular tenant user — explicit tenantId (interceptor hasn't run yet)
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, tenantId: payload.tenantId },
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

    // Lookup tenant's industry code for cross-cutting filters
    let businessTypeCode: string | undefined;
    if (user.tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { industryCode: true },
      });
      businessTypeCode = tenant?.industryCode ?? undefined;
    }

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
      tenantId: user.tenantId,
      businessTypeCode,
    };
  }
}
