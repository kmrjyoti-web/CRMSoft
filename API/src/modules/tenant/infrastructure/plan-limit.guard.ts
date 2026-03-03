import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LimitCheckerService, LimitResource } from '../services/limit-checker.service';

export const CHECK_LIMIT_KEY = 'checkLimit';

@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly limiter: LimitCheckerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<LimitResource>(
      CHECK_LIMIT_KEY,
      context.getHandler(),
    );

    if (!resource) return true;

    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;
    if (!tenantId) return true;

    const result = await this.limiter.canCreate(tenantId, resource);
    if (!result.allowed) {
      throw new ForbiddenException(
        `Plan limit reached for ${resource}: ${result.current}/${result.limit}`,
      );
    }

    return true;
  }
}
