import { Controller, Get, Put, Post, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotionSyncService } from '../services/notion-sync.service';
import { UpdateNotionConfigDto, CreateNotionEntryDto } from './dto/notion.dto';
import { MENU_SEED_DATA } from '../../menus/presentation/menu-seed-data';

@ApiTags('Settings - Notion')
@Controller('settings/notion')
export class NotionController {
  constructor(private readonly service: NotionSyncService) {}

  /** Get Notion config (token masked). */
  @Get()
  getConfig(@Req() req: any) {
    return this.service.getConfig(req.user.tenantId);
  }

  /** Save or update Notion config. */
  @Put()
  saveConfig(@Req() req: any, @Body() dto: UpdateNotionConfigDto) {
    return this.service.saveConfig(req.user.tenantId, dto.token ?? '', dto.databaseId, req.user.id);
  }

  /** Test the stored Notion connection. */
  @Post('test')
  testConnection(@Req() req: any) {
    return this.service.testConnection(req.user.tenantId);
  }

  /** List databases the integration can access. */
  @Get('databases')
  listDatabases(@Req() req: any) {
    return this.service.listDatabases(req.user.tenantId);
  }

  /** Create a session entry in Notion. */
  @Post('entries')
  createEntry(@Req() req: any, @Body() dto: CreateNotionEntryDto) {
    return this.service.createEntry(req.user.tenantId, dto);
  }

  /** List session entries from Notion. */
  @Get('entries')
  listEntries(@Req() req: any) {
    return this.service.listEntries(req.user.tenantId);
  }

  // ─── TEST LOG ENDPOINTS ────────────────────────────

  /**
   * GET /settings/notion/test-log/modules
   * Returns all CRM modules with their Notion test-log sync status.
   */
  @Get('test-log/modules')
  async listTestLogModules(@Req() req: any) {
    const modules = this.buildModuleList();
    return this.service.listModuleTestStatuses(req.user.tenantId, modules);
  }

  /**
   * POST /settings/notion/test-log/sync
   * Push a single module's test status update to Notion.
   */
  @Post('test-log/sync')
  async syncModuleStatus(
    @Req() req: any,
    @Body() body: {
      moduleId: string;
      moduleName: string;
      status: 'Not Started' | 'In Progress' | 'Done' | 'Blocked';
      notes?: string;
    },
  ) {
    return this.service.syncModuleTestStatus(
      req.user.tenantId,
      body.moduleId,
      body.moduleName,
      body.status,
      body.notes,
    );
  }

  /**
   * POST /settings/notion/test-log/sync-all
   * Bulk sync all modules to Notion with default "Not Started" status (skips already synced).
   */
  @Post('test-log/sync-all')
  async syncAllModules(
    @Req() req: any,
    @Body() body: { statuses?: Record<string, string> },
  ) {
    const modules = this.buildModuleList();
    const results: any[] = [];

    for (const m of modules) {
      try {
        const status = (body.statuses?.[m.id] as any) ?? 'Not Started';
        const result = await this.service.syncModuleTestStatus(
          req.user.tenantId, m.id, m.name, status,
        );
        results.push({ moduleId: m.id, moduleName: m.name, ...result });
      } catch {
        results.push({ moduleId: m.id, moduleName: m.name, error: 'sync_failed' });
      }
    }

    return { total: results.length, results };
  }

  /** Flatten MENU_SEED_DATA to a list of module descriptors */
  private buildModuleList(): Array<{ id: string; name: string; category?: string }> {
    const modules: Array<{ id: string; name: string; category?: string }> = [];

    const flatten = (items: any[], category?: string) => {
      for (const item of items) {
        if (item.code && item.name) {
          modules.push({ id: item.code, name: item.name, category });
        }
        if (item.children?.length) {
          flatten(item.children, category ?? item.name);
        }
      }
    };

    flatten(MENU_SEED_DATA);
    return modules;
  }
}
