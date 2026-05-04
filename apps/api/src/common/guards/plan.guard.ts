import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const REQUIRE_PLAN_KEY = 'requirePlan';

/** Minimum plan level required for a route. */
export const RequirePlan = (plan: string) => SetMetadata(REQUIRE_PLAN_KEY, plan);

const PLAN_LEVELS: Record<string, number> = {
  WL_FREE: 0,
  WL_STARTER: 1,
  WL_PROFESSIONAL: 2,
  WL_ENTERPRISE: 3,
  // CRM plans (legacy)
  FREE: 0,
  STARTER: 1,
  PROFESSIONAL: 2,
  ENTERPRISE: 3,
};

function planLevel(code: string | null | undefined): number {
  if (!code) return -1;
  return PLAN_LEVELS[code.toUpperCase()] ?? -1;
}

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<string>(REQUIRE_PLAN_KEY, context.getHandler());
    if (!required) return true;

    const req = context.switchToHttp().getRequest();
    const tenantPlanCode: string | null | undefined = req['tenant']?.planCode ?? req.user?.planCode;

    const tenantLevel = planLevel(tenantPlanCode);
    const requiredLevel = planLevel(required);

    if (tenantLevel < requiredLevel) {
      throw new ForbiddenException({
        error: 'PLAN_UPGRADE_REQUIRED',
        message: `This feature requires ${required} plan or higher. Current plan: ${tenantPlanCode ?? 'none'}.`,
        upgradeUrl: '/billing/upgrade',
        requiredPlan: required,
        currentPlan: tenantPlanCode ?? null,
      });
    }

    return true;
  }
}
