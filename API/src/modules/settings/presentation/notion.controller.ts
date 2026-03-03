import { Controller, Get, Put, Post, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotionSyncService } from '../services/notion-sync.service';
import { UpdateNotionConfigDto, CreateNotionEntryDto } from './dto/notion.dto';

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
}
