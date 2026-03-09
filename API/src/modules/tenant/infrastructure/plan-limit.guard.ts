import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LimitCheckerService } from '../services/limit-checker.service';

export const CHECK_LIMIT_KEY = 'checkLimit';

@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly limiter: LimitCheckerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<string>(
      CHECK_LIMIT_KEY,
      context.getHandler(),
    );

    if (!resource) return true;

    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;
    if (!tenantId) return true;

    const result = await this.limiter.checkResource(tenantId, resource);

    if (result.limitType === 'DISABLED') {
      throw new ForbiddenException(
        `Feature not available in your plan: ${resource}`,
      );
    }

    if (!result.allowed) {
      const limitLabel = result.limitType === 'MONTHLY' ? 'monthly limit' : 'limit';
      throw new ForbiddenException(
        `Plan ${limitLabel} reached for ${resource}: ${result.current}/${result.limit}`,
      );
    }

    return true;
  }
}
