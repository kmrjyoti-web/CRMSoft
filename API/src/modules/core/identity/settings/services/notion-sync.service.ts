import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { AppError } from '../../../../../common/errors/app-error';

@Injectable()
export class NotionSyncService {
  private readonly logger = new Logger(NotionSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get config with masked token. */
  async getConfig(tenantId: string) {
    const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });
    if (!config) return null;
    return {
      id: config.id,
      tenantId: config.tenantId,
      tokenMasked: config.token ? `${config.token.slice(0, 8)}...${'*'.repeat(12)}` : '',
      databaseId: config.databaseId,
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  /** Save or update config. */
  async saveConfig(tenantId: string, token: string, databaseId?: string, userId?: string) {
    const update: Record<string, unknown> = { updatedById: userId };
    if (token) update.token = token;
    if (databaseId !== undefined) update.databaseId = databaseId;

    return this.prisma.notionConfig.upsert({
      where: { tenantId },
      update,
      create: { tenantId, token, databaseId, updatedById: userId } as any,
    });
  }

  /** Test connection using stored token. */
  async testConnection(tenantId: string) {
    const client = await this.getClient(tenantId);
    try {
      const me = await client.users.me({});
      return { success: true, user: me.name ?? me.id };
    } catch (err: any) {
      this.logger.warn(`Notion connection test failed for tenant ${tenantId}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /** List databases the integration has access to. */
  async listDatabases(tenantId: string) {
    const client = await this.getClient(tenantId);
    const response = await client.search({
      filter: { property: 'object', value: 'data_source' },
      page_size: 50,
    });
    return response.results.map((db: any) => ({
      id: db.id,
      title: db.title?.[0]?.plain_text ?? 'Untitled',
    }));
  }

  /** Create a session entry in the Notion database. */
  async createEntry(
    tenantId: string,
    data: {
      promptNumber: string;
      title: string;
      description?: string;
      status: string;
      filesChanged?: string;
      testResults?: string;
    },
  ) {
    const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });
    if (!config?.databaseId) {
      throw AppError.from('NOTION_DATABASE_NOT_SET');
    }

    const client = await this.getClient(tenantId);

    const properties: Record<string, any> = {
      'Prompt': { title: [{ text: { content: data.promptNumber } }] },
      'Title': { rich_text: [{ text: { content: data.title } }] },
      'Date': { date: { start: new Date().toISOString().split('T')[0] } },
      'Status': { select: { name: data.status } },
    };

    if (data.description) {
      properties['Description'] = { rich_text: [{ text: { content: data.description.slice(0, 2000) } }] };
    }
    if (data.filesChanged) {
      properties['Files Changed'] = { rich_text: [{ text: { content: data.filesChanged.slice(0, 2000) } }] };
    }
    if (data.testResults) {
      properties['Test Results'] = { rich_text: [{ text: { content: data.testResults.slice(0, 2000) } }] };
    }

    const page = await client.pages.create({
      parent: { database_id: config.databaseId },
      properties,
    });

    return { id: page.id, url: (page as any).url };
  }

  /** List entries from the Notion database. */
  async listEntries(tenantId: string) {
    const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });
    if (!config?.databaseId) {
      return [];
    }

    const client = await this.getClient(tenantId);

    const response = await client.dataSources.query({
      data_source_id: config.databaseId,
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 100,
    });

    return response.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        promptNumber: props['Prompt']?.title?.[0]?.plain_text ?? '',
        title: props['Title']?.rich_text?.[0]?.plain_text ?? '',
        description: props['Description']?.rich_text?.[0]?.plain_text ?? '',
        status: props['Status']?.select?.name ?? '',
        filesChanged: props['Files Changed']?.rich_text?.[0]?.plain_text ?? '',
        testResults: props['Test Results']?.rich_text?.[0]?.plain_text ?? '',
        date: props['Date']?.date?.start ?? '',
        url: page.url,
      };
    });
  }

  // ─────────────────────────────────────────────────────────
  // MODULE TEST LOG  (for Vendor Panel Notion Test Log page)
  // ─────────────────────────────────────────────────────────

  /**
   * Sync a module's test status to Notion as a named page.
   * Upserts: if a page for this module already exists (matched by 'Module' property), updates it;
   * otherwise creates a new page.
   */
  async syncModuleTestStatus(
    tenantId: string,
    moduleId: string,
    moduleName: string,
    status: 'Not Started' | 'In Progress' | 'Done' | 'Blocked',
    notes?: string,
  ): Promise<{ id: string; url: string }> {
    const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });
    if (!config?.databaseId) {
      throw AppError.from('NOTION_DATABASE_NOT_SET');
    }

    const client = await this.getClient(tenantId);

    // Search for existing page with matching module ID
    const existing = await client.dataSources.query({
      data_source_id: config.databaseId,
      filter: {
        property: 'Module ID',
        rich_text: { equals: moduleId },
      } as any,
      page_size: 1,
    }).catch(() => ({ results: [] as any[] }));

    const properties: Record<string, any> = {
      'Prompt': { title: [{ text: { content: moduleName } }] },
      'Module ID': { rich_text: [{ text: { content: moduleId } }] },
      'Status': { select: { name: status } },
      'Date': { date: { start: new Date().toISOString().split('T')[0] } },
    };

    if (notes) {
      properties['Description'] = { rich_text: [{ text: { content: notes.slice(0, 2000) } }] };
    }

    let page: any;
    if (existing.results.length > 0) {
      page = await client.pages.update({
        page_id: existing.results[0].id,
        properties,
      });
    } else {
      page = await client.pages.create({
        parent: { database_id: config.databaseId },
        properties,
      });
    }

    this.logger.log(`Notion module test status synced: ${moduleName} → ${status}`);
    return { id: page.id, url: (page as any).url ?? '' };
  }

  /**
   * List all module test statuses from Notion, merged with the provided module list.
   * Returns each module with its current Notion sync status.
   */
  async listModuleTestStatuses(
    tenantId: string,
    modules: Array<{ id: string; name: string; category?: string }>,
  ): Promise<Array<{
    moduleId: string;
    moduleName: string;
    category?: string;
    notionStatus: string;
    notionPageId?: string;
    notionUrl?: string;
    lastSyncedAt?: string;
    syncState: 'synced' | 'not_synced';
  }>> {
    const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });

    if (!config?.databaseId || !config?.token) {
      // Return all modules as not synced
      return modules.map(m => ({
        moduleId: m.id,
        moduleName: m.name,
        category: m.category,
        notionStatus: 'Not Started',
        syncState: 'not_synced' as const,
      }));
    }

    let notionPages: any[] = [];
    try {
      const client = await this.getClient(tenantId);
      const response = await client.dataSources.query({
        data_source_id: config.databaseId,
        page_size: 200,
      });
      notionPages = response.results;
    } catch (err: any) {
      this.logger.warn(`Failed to fetch Notion test log: ${err.message}`);
    }

    // Build a lookup map by Module ID property
    const notionMap = new Map<string, any>();
    for (const page of notionPages) {
      const moduleId = (page as any).properties?.['Module ID']?.rich_text?.[0]?.plain_text ?? '';
      if (moduleId) notionMap.set(moduleId, page);
    }

    return modules.map(m => {
      const page = notionMap.get(m.id);
      if (!page) {
        return {
          moduleId: m.id,
          moduleName: m.name,
          category: m.category,
          notionStatus: 'Not Started',
          syncState: 'not_synced' as const,
        };
      }
      return {
        moduleId: m.id,
        moduleName: m.name,
        category: m.category,
        notionStatus: page.properties?.['Status']?.select?.name ?? 'Not Started',
        notionPageId: page.id,
        notionUrl: (page as any).url,
        lastSyncedAt: page.last_edited_time,
        syncState: 'synced' as const,
      };
    });
  }

  /** Build a Notion client from stored token. */
  private async getClient(tenantId: string): Promise<Client> {
    const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });
    if (!config?.token) {
      throw AppError.from('NOTION_NOT_CONFIGURED');
    }
    return new Client({ auth: config.token });
  }
}
