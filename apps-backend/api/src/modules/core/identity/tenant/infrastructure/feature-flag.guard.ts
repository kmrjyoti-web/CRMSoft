import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LimitCheckerService } from '../services/limit-checker.service';

export const REQUIRE_FEATURE_KEY = 'requireFeature';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly limiter: LimitCheckerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<string>(
      REQUIRE_FEATURE_KEY,
      context.getHandler(),
    );

    if (!feature) return true;

    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;
    if (!tenantId) return true;

    const hasIt = await this.limiter.hasFeature(tenantId, feature);
    if (!hasIt) {
      throw new ForbiddenException(
        `Feature not available in your plan: ${feature}`,
      );
    }

    return true;
  }
}
