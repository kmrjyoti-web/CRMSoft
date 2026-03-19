import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class NotionDocsService {
  private readonly logger = new Logger(NotionDocsService.name);
  private notion: Client | null = null;

  constructor(private readonly prisma: PrismaService) {
    const token = process.env.NOTION_TOKEN;
    if (token) {
      this.notion = new Client({ auth: token });
      this.logger.log('Notion client initialized');
    } else {
      this.logger.warn('NOTION_TOKEN not set — Notion integration disabled');
    }
  }

  get isConfigured(): boolean {
    return this.notion !== null;
  }

  async publishReleaseNotes(versionId: string): Promise<string | null> {
    if (!this.notion) {
      this.logger.warn('Notion not configured, skipping release notes publish');
      return null;
    }

    const version = await (this.prisma as any).appVersion.findUnique({
      where: { id: versionId },
      include: { patches: true },
    });
    if (!version) return null;

    const databaseId = process.env.NOTION_RELEASES_DB_ID;
    if (!databaseId) {
      this.logger.warn('NOTION_RELEASES_DB_ID not set');
      return null;
    }

    try {
      const changelog = (version.changelog as any[]) || [];
      const breakingChanges = (version.breakingChanges as any[]) || [];

      const children: any[] = [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: `Release ${version.version}` } }],
          },
        },
      ];

      // Add changelog sections
      for (const section of changelog) {
        children.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: section.category || 'General' } }],
          },
        });
        for (const item of section.items || []) {
          children.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ type: 'text', text: { content: item } }],
            },
          });
        }
      }

      // Add breaking changes
      if (breakingChanges.length > 0) {
        children.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: '⚠️ Breaking Changes' } }],
          },
        });
        for (const bc of breakingChanges) {
          children.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ type: 'text', text: { content: typeof bc === 'string' ? bc : JSON.stringify(bc) } }],
            },
          });
        }
      }

      // Add industry patches
      if (version.patches.length > 0) {
        children.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: 'Industry Patches' } }],
          },
        });
        for (const patch of version.patches) {
          children.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ type: 'text', text: { content: `[${patch.industryCode}] ${patch.patchName}: ${patch.description || 'No description'}` } }],
            },
          });
        }
      }

      const page = await this.notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: `v${version.version} — ${version.codeName || version.releaseType}` } }] },
          Version: { rich_text: [{ text: { content: version.version } }] },
          Status: { select: { name: version.status } },
          'Release Type': { select: { name: version.releaseType } },
        },
        children,
      });

      // Save Notion page ID
      await (this.prisma as any).appVersion.update({
        where: { id: versionId },
        data: { notionPageId: page.id },
      });

      this.logger.log(`Published release notes to Notion: ${page.id}`);
      return page.id;
    } catch (error: any) {
      this.logger.error(`Failed to publish to Notion: ${error.message}`);
      return null;
    }
  }

  async getStatus() {
    return {
      configured: this.isConfigured,
      hasDatabaseId: !!process.env.NOTION_RELEASES_DB_ID,
    };
  }
}
