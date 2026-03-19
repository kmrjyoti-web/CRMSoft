import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../../common/decorators/roles.decorator';
import { IS_SUPER_ADMIN_ROUTE } from './decorators/super-admin-route.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super admins bypass tenant check
    if (user?.isSuperAdmin) return true;

    // Vendors bypass tenant check (they operate cross-tenant)
    if (user?.vendorId || user?.userType === 'VENDOR') return true;

    if (!user?.tenantId) {
      throw new UnauthorizedException('Tenant context required');
    }

    return true;
  }
}
