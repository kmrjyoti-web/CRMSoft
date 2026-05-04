import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { PrismaService } from '@core/prisma/prisma.service';

interface ModuleComponent {
  moduleName: string;
  componentName: string;
  functionality: string;
  layer: string;
  priority: string;
}

@Injectable()
export class DevQANotionService {
  private readonly logger = new Logger(DevQANotionService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------
  // AUTO-GENERATE TEST PLAN FROM MODULE REGISTRY
  // ---------------------------------------------------------

  async generateModuleTestPlan(
    planName: string,
    moduleNames: string[] | undefined,
    createdById: string,
    tenantId: string,
  ): Promise<{ planId: string; itemCount: number }> {
    const components = await this.discoverComponents(moduleNames);

    // Create the TestPlan
    const plan = await this.prisma.platform.testPlan.create({
      data: {
        tenantId,
        name: planName,
        description: `Auto-generated QA plan covering ${components.length} components`,
        targetModules: moduleNames ?? [],
        status: 'ACTIVE',
        createdById,
      },
    });

    // Create all TestPlanItems
    if (components.length > 0) {
      await this.prisma.platform.testPlanItem.createMany({
        data: components.map((c, i) => ({
          planId: plan.id,
          moduleName: c.moduleName,
          componentName: c.componentName,
          functionality: c.functionality,
          layer: c.layer,
          priority: c.priority as any,
          sortOrder: i,
        })),
      });
    }

    // Update stats
    await this.prisma.platform.testPlan.update({
      where: { id: plan.id },
      data: { totalItems: components.length },
    });

    this.logger.log(`Generated QA plan "${planName}" with ${components.length} items`);
    return { planId: plan.id, itemCount: components.length };
  }

  // ---------------------------------------------------------
  // DISCOVER COMPONENTS FROM SOURCE
  // ---------------------------------------------------------

  private async discoverComponents(moduleNames?: string[]): Promise<ModuleComponent[]> {
    const components: ModuleComponent[] = [];

    // Pull known modules from PageRegistry if available
    const pages = await this.prisma.platform.pageRegistry.findMany({
      select: { moduleCode: true, componentName: true, friendlyName: true, routePath: true },
      take: 200,
    }).catch(() => []);

    const moduleFilter = moduleNames && moduleNames.length > 0 ? moduleNames : null;

    // Generate items from page registry (UI layer)
    for (const page of pages) {
      if (!page.moduleCode) continue;
      if (moduleFilter && !moduleFilter.includes(page.moduleCode)) continue;
      components.push({
        moduleName: page.moduleCode,
        componentName: page.friendlyName ?? page.componentName ?? page.routePath,
        functionality: `Page renders correctly and core actions work: ${page.routePath}`,
        layer: 'UI',
        priority: 'MEDIUM',
      });
    }

    // Add well-known CRM modules manually if no pages registered
    const defaultModules = moduleFilter ?? [
      'leads', 'contacts', 'organizations', 'invoicing', 'payments',
      'orders', 'stock', 'accounts', 'quotations', 'activities',
      'settings', 'users', 'roles', 'workflows', 'tickets',
    ];

    for (const mod of defaultModules) {
