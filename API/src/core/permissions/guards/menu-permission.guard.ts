import {
  CanActivate, ExecutionContext, Injectable, ForbiddenException, Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MENU_PERMISSION_KEY, MenuPermissionMeta } from '../decorators/require-menu-permission.decorator';
import { IS_PUBLIC_KEY } from '../../../common/decorators/roles.decorator';
import { MenuPermissionService } from '../../../modules/core/menus/application/services/menu-permission.service';

/**
 * Guard that checks per-menu CRUD permissions via RoleMenuPermission table.
 * Supports single action, multi-action (AND/OR), and shorthand decorators.
 * Must be explicitly applied per-route (not a global APP_GUARD).
 */
@Injectable()
export class MenuPermissionGuard implements CanActivate {
  private readonly logger = new Logger(MenuPermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly menuPermissionService: MenuPermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (isPublic) return true;

    // Get menu permission metadata
    const meta = this.reflector.getAllAndOverride<MenuPermissionMeta>(MENU_PERMISSION_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (!meta) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Super admin bypasses
    if (user.isSuperAdmin) return true;

    const tenantId = user.tenantId;
    const roleId = user.roleId;
    const roleName = user.role || user.roleName;

    if (!tenantId || !roleId) {
      throw new ForbiddenException('Tenant or role not found');
    }

    const { menuCode, action, actions, requireAll } = meta;

    let allowed: boolean;

    if (actions && actions.length > 0) {
      // Multi-action check
      if (requireAll) {
        allowed = await this.menuPermissionService.hasAllPermissions(
          tenantId, roleId, menuCode, actions, roleName,
        );
      } else {
        allowed = await this.menuPermissionService.hasAnyPermission(
          tenantId, roleId, menuCode, actions, roleName,
        );
      }
    } else {
      // Single action check
      allowed = await this.menuPermissionService.hasPermission(
        tenantId, roleId, menuCode, action, roleName,
      );
    }

    if (!allowed) {
      const actionLabel = actions?.join(', ') || action;
      this.logger.warn(
        `Permission denied: User ${user.id} (role: ${roleName}) attempted ${actionLabel} on ${menuCode}`,
      );

      throw new ForbiddenException({
        errorCode: 'MENU_PERMISSION_DENIED',
        message: `You do not have permission to ${actionLabel} on ${menuCode}`,
        messageHi: `आपको ${menuCode} पर ${actionLabel} करने की अनुमति नहीं है`,
        menuCode,
        action: actionLabel,
      });
    }

    return true;
  }
}
