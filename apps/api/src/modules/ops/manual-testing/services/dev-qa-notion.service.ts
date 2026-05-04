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
      // API layer — CRUD operations
      for (const op of ['Create', 'List', 'GetById', 'Update', 'Delete']) {
        components.push({
          moduleName: mod,
          componentName: `${this.toPascal(mod)}Controller`,
          functionality: `${op} ${mod} — correct status code, response shape, and data`,
          layer: 'API',
          priority: op === 'Create' || op === 'List' ? 'HIGH' : 'MEDIUM',
        });
      }

      // DB layer — core integrity checks
      components.push({
        moduleName: mod,
        componentName: `${this.toPascal(mod)} DB Model`,
        functionality: `FK constraints valid, required fields non-null, unique constraints hold`,
        layer: 'DB',
        priority: 'HIGH',
      });

      // Auth layer
      components.push({
        moduleName: mod,
        componentName: `${this.toPascal(mod)}Controller`,
        functionality: `Unauthenticated access returns 401, cross-tenant access returns 403`,
        layer: 'API',
        priority: 'CRITICAL',
      });
    }

    // De-duplicate
    const seen = new Set<string>();
    return components.filter(c => {
      const key = `${c.moduleName}:${c.componentName}:${c.functionality}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // ---------------------------------------------------------
  // SYNC TO NOTION
  // ---------------------------------------------------------

  async syncToNotion(planId: string, tenantId: string): Promise<{ notionUrl: string; syncedCount: number }> {
    const plan = await this.prisma.platform.testPlan.findFirst({
      where: { id: planId, tenantId },
      include: { items: true },
    });
    if (!plan) throw new NotFoundException(`TestPlan ${planId} not found`);

    const client = await this.getNotionClient(tenantId);
    const databaseId = await this.getOrCreateNotionDatabase(client, tenantId, plan.name);

    let syncedCount = 0;

    for (const item of plan.items) {
      try {
        const properties: Record<string, any> = {
          Module: { title: [{ text: { content: item.moduleName } }] },
          Component: { rich_text: [{ text: { content: item.componentName } }] },
          Functionality: { rich_text: [{ text: { content: item.functionality.substring(0, 2000) } }] },
          Layer: { select: { name: item.layer } },
          Status: { select: { name: item.status.replace('_', ' ') } },
          Priority: { select: { name: item.priority } },
          Notes: { rich_text: item.notes ? [{ text: { content: item.notes.substring(0, 2000) } }] : [] },
        };

        if (item.notionBlockId) {
          // Update existing Notion row
          await client.pages.update({ page_id: item.notionBlockId, properties });
        } else {
          // Create new Notion row
          const page = await client.pages.create({
            parent: { database_id: databaseId },
            properties,
          });
          await this.prisma.platform.testPlanItem.update({
            where: { id: item.id },
            data: { notionBlockId: page.id },
          });
        }

        syncedCount++;
      } catch (err: any) {
        this.logger.warn(`Failed to sync item ${item.id} to Notion: ${err.message}`);
      }
    }

    // Update plan with Notion page reference and sync time
    await this.prisma.platform.testPlan.update({
      where: { id: planId },
      data: {
        notionPageId: databaseId,
        notionSyncedAt: new Date(),
      },
    });

    const notionUrl = `https://notion.so/${databaseId.replace(/-/g, '')}`;
    this.logger.log(`Synced plan ${planId} ? Notion (${syncedCount}/${plan.items.length} items)`);
    return { notionUrl, syncedCount };
  }

  // ---------------------------------------------------------
  // PULL FROM NOTION
  // ---------------------------------------------------------

  async pullFromNotion(planId: string, tenantId: string): Promise<{ updated: number }> {
    const plan = await this.prisma.platform.testPlan.findFirst({
      where: { id: planId, tenantId },
      include: { items: { where: { notionBlockId: { not: null } } } },
    });
    if (!plan) throw new NotFoundException(`TestPlan ${planId} not found`);
    if (!plan.notionPageId) return { updated: 0 };

    const client = await this.getNotionClient(tenantId);
    let updated = 0;

    for (const item of plan.items) {
      if (!item.notionBlockId) continue;
      try {
        const page = await client.pages.retrieve({ page_id: item.notionBlockId }) as any;
        const notionStatus = page.properties?.Status?.select?.name?.replace(' ', '_') ?? null;
        const notionNotes = page.properties?.Notes?.rich_text?.[0]?.plain_text ?? null;

        const updates: Record<string, any> = {};
        if (notionStatus && notionStatus !== item.status) updates.status = notionStatus;
        if (notionNotes && notionNotes !== item.notes) updates.notes = notionNotes;

        if (Object.keys(updates).length > 0) {
          await this.prisma.platform.testPlanItem.update({ where: { id: item.id }, data: updates });
          updated++;
        }
      } catch (err: any) {
        this.logger.warn(`Failed to pull item ${item.id} from Notion: ${err.message}`);
      }
    }

    this.logger.log(`Pulled ${updated} update(s) from Notion for plan ${planId}`);
    return { updated };
  }

  // ---------------------------------------------------------
  // NOTION HELPERS
  // ---------------------------------------------------------

  private async getNotionClient(tenantId: string): Promise<Client> {
    const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } }).catch(() => null);
    const token = config?.token ?? process.env.NOTION_API_KEY;
    if (!token) throw new Error('Notion API key not configured. Set it in Settings ? Notion or NOTION_API_KEY env var.');
    return new Client({ auth: token });
  }

  private async getOrCreateNotionDatabase(client: Client, tenantId: string, planName: string): Promise<string> {
    const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } }).catch(() => null);

    // If a specific database is configured, use it
    if (config?.databaseId) return config.databaseId;

    // Search for an existing "Dev QA" database
    const search = await client.search({
      query: `Dev QA: ${planName}`,
      filter: { property: 'object', value: 'data_source' },
      page_size: 1,
    }).catch(() => ({ results: [] }));

    if (search.results.length > 0) return (search.results[0] as any).id;

    // Create a new database (requires a parent page_id in env)
    const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
    if (!parentPageId) throw new Error('NOTION_PARENT_PAGE_ID not set — cannot create Notion database automatically');

    const db = await client.databases.create({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: `Dev QA: ${planName}` } }],
      properties: {
        Module: { title: {} },
        Component: { rich_text: {} },
        Functionality: { rich_text: {} },
        Layer: { select: { options: [{ name: 'UI' }, { name: 'API' }, { name: 'DB' }, { name: 'ARCH' }, { name: 'INTEGRATION' }] } },
        Status: { select: { options: [
          { name: 'NOT STARTED' }, { name: 'IN PROGRESS' }, { name: 'PASSED' },
          { name: 'FAILED' }, { name: 'PARTIAL' }, { name: 'BLOCKED' },
        ]}},
        Priority: { select: { options: [{ name: 'LOW' }, { name: 'MEDIUM' }, { name: 'HIGH' }, { name: 'CRITICAL' }] } },
        Notes: { rich_text: {} },
      },
    } as any);

    return db.id;
  }

  private toPascal(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
