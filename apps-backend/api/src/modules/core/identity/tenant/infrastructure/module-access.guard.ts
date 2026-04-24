import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleAccessService } from '../services/module-access.service';

export const REQUIRE_MODULE_KEY = 'requiredModule';

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleAccessService: ModuleAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleCode = this.reflector.get<string>(
      REQUIRE_MODULE_KEY,
      context.getHandler(),
    );

    if (!moduleCode) return true; // no module requirement

    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId || request.user?.tenantId;
    if (!tenantId) return true; // no tenant context (super admin)

    const result = await this.moduleAccessService.checkAccess(tenantId, moduleCode);
    if (!result.allowed) {
      throw new ForbiddenException(
        `Module '${moduleCode}' is not available in your current plan`,
      );
    }

    request.moduleAccessLevel = result.accessLevel;
    return true;
  }
}
