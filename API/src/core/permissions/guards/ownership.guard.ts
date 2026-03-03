import {
  CanActivate, ExecutionContext, Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OwnershipEngine } from '../engines/ownership.engine';
import { OWNERSHIP_KEY } from '../decorators/require-ownership.decorator';
import { IS_PUBLIC_KEY } from '../../../common/decorators/roles.decorator';
import { PermissionContext } from '../types/permission-context';
import { PermissionError } from '../types/permission-error';

/**
 * Ownership guard — verifies entity ownership when @RequireOwnership() is used.
 * Can be applied per-route in addition to the global PermissionPolicyGuard.
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly ownershipEngine: OwnershipEngine,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (isPublic) return true;

    const meta = this.reflector.get<{ resourceType: string; paramName: string }>(
      OWNERSHIP_KEY, context.getHandler(),
    );
    if (!meta) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new PermissionError('AUTH_REQUIRED', 'ownership:check');

    const resourceId = request.params[meta.paramName];
    if (!resourceId) return true;

    const methodMap: Record<string, string> = {
      GET: 'read', POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete',
    };
    const actionSuffix = methodMap[request.method] || 'read';

    const ctx: PermissionContext = {
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role || user.roleName,
      roleLevel: user.roleLevel ?? 5,
      action: `${meta.resourceType}s:${actionSuffix}`,
      resourceType: meta.resourceType,
      resourceId,
    };

    const allowed = await this.ownershipEngine.check(ctx);
    if (!allowed) {
      throw new PermissionError('OWNERSHIP_DENIED', ctx.action, 'OWNERSHIP');
    }
    return true;
  }
}
