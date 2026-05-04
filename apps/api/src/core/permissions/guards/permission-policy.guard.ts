import {
  CanActivate, ExecutionContext, Injectable, Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionChainService } from '../services/permission-chain.service';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { OWNERSHIP_KEY } from '../decorators/require-ownership.decorator';
import { IS_PUBLIC_KEY } from '../../../common/decorators/roles.decorator';
import { PermissionContext } from '../types/permission-context';
import { PermissionError, ApprovalRequiredError } from '../types/permission-error';

/**
 * Global permission policy guard. Registered as APP_GUARD.
 * Reads @RequirePermissions() and @RequireOwnership() metadata.
 * Skips routes marked with @Public().
 */
@Injectable()
export class PermissionPolicyGuard implements CanActivate {
  private readonly logger = new Logger(PermissionPolicyGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionChain: PermissionChainService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (isPublic) return true;

    // Get permission requirements
    const permissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(), context.getClass(),
    ]);

    // No @RequirePermissions decorator → allow (JwtAuthGuard already ran)
    if (!permissions || permissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new PermissionError('AUTH_REQUIRED', permissions[0]);

    // Super admin bypasses all permission checks
    if (user.isSuperAdmin) return true;

    // TODO post-demo: remove once PermissionChain evaluates company role from JWT.
    // Company owners need ADMIN-level access; identity role is CUSTOMER until
    // the permission chain is updated to consider companyRole.
    if (user.companyRole === 'OWNER') return true;

    // Get ownership metadata
    const ownershipMeta = this.reflector.get<{ resourceType: string; paramName: string }>(
      OWNERSHIP_KEY, context.getHandler(),
    );

    // Try ANY of the permissions (OR logic)
    for (const action of permissions) {
      const ctx: PermissionContext = {
        userId: user.id,
        roleId: user.roleId,
        roleName: user.role || user.roleName,
        roleLevel: user.roleLevel ?? 5,
        departmentId: user.departmentId,
        departmentPath: user.departmentPath,
        action,
        resourceType: ownershipMeta?.resourceType || request.params?.entityType,
        resourceId: request.params?.[ownershipMeta?.paramName || 'id'],
        attributes: request.body,
      };

      const result = await this.permissionChain.can(ctx);

      if (result.allowed) {
        // Attach maker-checker info to request if applicable
        if (result.makerChecker?.requiresApproval) {
          request.makerChecker = result.makerChecker;
        }
        return true;
      }

      this.logger.debug(`Denied: ${result.reason} for ${action}`);
    }

    throw new PermissionError('PERMISSION_DENIED', permissions[0]);
  }
}
