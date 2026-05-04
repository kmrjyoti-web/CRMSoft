import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class ModuleAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all module access entries for a specific plan.
   */
  async getByPlan(planId: string) {
    const plan = await this.prisma.identity.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException(`Plan ${planId} not found`);
    }

    return this.prisma.identity.planModuleAccess.findMany({
      where: { planId },
      orderBy: { moduleCode: 'asc' },
    });
  }

  /**
   * Upsert module access for a plan.
   * Uses a transaction to upsert each module access record atomically.
   */
  async upsertAccess(
    planId: string,
    modules: Array<{
      moduleCode: string;
      accessLevel: string;
      customConfig?: Record<string, unknown>;
    }>,
  ) {
    const plan = await this.prisma.identity.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException(`Plan ${planId} not found`);
    }

    return this.prisma.identity.$transaction(
      modules.map((mod) =>
        this.prisma.identity.planModuleAccess.upsert({
          where: {
            planId_moduleCode: { planId, moduleCode: mod.moduleCode },
          },
          update: {
            accessLevel: mod.accessLevel as any,
            customConfig: mod.customConfig ?? null as any,
          },
          create: {
            planId,
            moduleCode: mod.moduleCode,
            accessLevel: mod.accessLevel as any,
            customConfig: mod.customConfig ?? null as any,
          },
        }),
      ),
    );
  }

  /**
   * Check if a tenant has access to a specific module.
   * Resolution: tenant -> active subscription -> plan -> PlanModuleAccess
   * Core modules (from ModuleDefinition) always return allowed.
   */
  async checkAccess(
    tenantId: string,
    moduleCode: string,
  ): Promise<{ allowed: boolean; accessLevel: string }> {
    // Check if module is a core module (always allowed)
    const moduleDef = await this.prisma.platform.moduleDefinition.findUnique({
      where: { code: moduleCode },
    });

    if (moduleDef?.isCore) {
      return { allowed: true, accessLevel: 'MOD_FULL' };
    }

    // Get tenant's active subscription
    const subscription = await this.prisma.identity.subscription.findFirst({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return { allowed: false, accessLevel: 'MOD_DISABLED' };
    }

    // Find module access for the subscription's plan
    const access = await this.prisma.identity.planModuleAccess.findUnique({
      where: {
        planId_moduleCode: {
          planId: subscription.planId,
          moduleCode,
        },
      },
    });

    if (!access) {
      // No access record means module is not configured for this plan
      return { allowed: false, accessLevel: 'MOD_DISABLED' };
    }

    if (access.accessLevel === 'MOD_DISABLED') {
      return { allowed: false, accessLevel: 'MOD_DISABLED' };
    }

    return { allowed: true, accessLevel: access.accessLevel };
  }

  /**
   * Get the full access matrix: all plans with their module access entries.
   * Useful for rendering a matrix view in the admin panel.
   */
  async getAccessMatrix() {
    const plans = await this.prisma.identity.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        moduleAccess: {
          orderBy: { moduleCode: 'asc' },
        },
      },
    });

    const modules = await this.prisma.platform.moduleDefinition.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });

    return { plans, modules };
  }
}
