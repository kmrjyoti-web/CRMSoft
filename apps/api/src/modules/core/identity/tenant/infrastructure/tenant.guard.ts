import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { CrossDbResolverService } from '../../../../../core/prisma/cross-db-resolver.service';
import { IS_PUBLIC_KEY, SKIP_TENANT_GUARD_KEY } from '../../../../../common/decorators/roles.decorator';
import { IS_SUPER_ADMIN_ROUTE } from './decorators/super-admin-route.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    private readonly crossDbResolver: CrossDbResolverService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip for public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Skip for super admin routes
    const isSuperAdminRoute = this.reflector.getAllAndOverride<boolean>(IS_SUPER_ADMIN_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSuperAdminRoute) return true;

    // Skip for auth-context routes (JWT still required, but no tenant yet — e.g. /auth/me/companies)
    const skipTenantGuard = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_GUARD_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipTenantGuard) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    // Super admins bypass tenant check
    if (user.isSuperAdmin) return true;

    // Vendors bypass tenant check (they operate cross-tenant)
    if (user.vendorId || user.userType === 'VENDOR') return true;

    // ─── RESOLUTION CHAIN ────────────────────────────────────────────────────
    // Priority:
    //   1. JWT tenantId — set by generateTokens (with DEFAULT_TENANT_ID fallback)
    //   2. companyId → tenantId lookup (Company.tenantId roadmap — stub returns null now)
    //   3. DEFAULT_TENANT_ID — FREE plan / new signups with no dedicated tenant yet
    // ─────────────────────────────────────────────────────────────────────────

    let tenantId: string | null = user.tenantId || null;

    // Path 2: companyId → tenantId resolution
    if (!tenantId && user.companyId) {
      const resolved = await this.crossDbResolver.resolveCompanyToTenant(user.companyId);
      tenantId = resolved?.tenantId ?? null;
    }

    // Path 3: shared / FREE plan fallback
    if (!tenantId) {
      tenantId = this.config.get<string>('DEFAULT_TENANT_ID') || null;
      if (tenantId) {
        this.logger.debug(`Resolved DEFAULT_TENANT_ID for user=${user.id} (shared/FREE plan)`);
      }
    }

    if (!tenantId) {
      this.logger.error(`TENANT_RESOLUTION_FAILED user=${user.id} companyId=${user.companyId}`);
      throw new UnauthorizedException('Tenant context required');
    }

    // Attach resolved context to request for downstream services
    request.tenantId = tenantId;
    request.companyId = user.companyId ?? null;
    request.isSharedTenant = user.isSharedTenant ?? (tenantId === this.config.get('DEFAULT_TENANT_ID'));

    return true;
  }
}
