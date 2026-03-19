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

  /** Build a Notion client from stored token. */
  private async getClient(tenantId: string): Promise<Client> {
    const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });
    if (!config?.token) {
      throw AppError.from('NOTION_NOT_CONFIGURED');
    }
    return new Client({ auth: config.token });
  }
}
