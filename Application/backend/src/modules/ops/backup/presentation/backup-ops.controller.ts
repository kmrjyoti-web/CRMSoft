import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { BackupService, BackupSchema } from '../backup.service';

@Controller('ops/backups')
@UseGuards(JwtAuthGuard)
@RequirePermissions('ops:manage')
export class BackupOpsController {
  constructor(private readonly backup: BackupService) {}

  /** GET /ops/backups — List backup logs */
  @Get()
  async list(@Query('schema') schema?: string, @Query('limit') limit?: string) {
    const data = await this.backup.listBackups(schema, limit ? Number(limit) : 50);
    return ApiResponse.success(data);
  }

  /** GET /ops/backups/:id — Get single backup log */
  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.backup.getBackup(id);
    if (!data) throw new NotFoundException('Backup not found');
    return ApiResponse.success(data);
  }

  /** GET /ops/backups/:id/download — Get presigned download URL from R2 */
  @Get(':id/download')
  async download(@Param('id', ParseUUIDPipe) id: string) {
    const url = await this.backup.getPresignedDownloadUrl(id);
    if (!url) throw new NotFoundException('No R2 file for this backup');
    return ApiResponse.success({ url, expiresIn: 3600 }, 'Presigned URL valid for 1 hour');
  }

  /** POST /ops/backups/run — Trigger backup for a specific schema */
  @Post('run')
  async run(
    @Body() body: { schema: BackupSchema; retentionDays?: number },
    @CurrentUser('id') userId: string,
  ) {
    if (!this.backup.isPgDumpAvailable()) {
      return ApiResponse.error('pg_dump is not available on this server');
    }
    const result = await this.backup.backupSchema(body.schema, userId, body.retentionDays);
    return ApiResponse.success(result, result.status === 'SUCCESS' ? 'Backup completed' : 'Backup failed');
  }

  /** POST /ops/backups/run-all — Backup all 4 schemas */
  @Post('run-all')
  async runAll(@CurrentUser('id') userId: string) {
    if (!this.backup.isPgDumpAvailable()) {
      return ApiResponse.error('pg_dump is not available on this server');
    }
    const results = await this.backup.backupAllSchemas(userId);
    const succeeded = results.filter((r) => r.status === 'SUCCESS').length;
    return ApiResponse.success(results, `${succeeded}/${results.length} schemas backed up`);
  }

  /** POST /ops/backups/:id/restore — Restore database from backup */
  @Post(':id/restore')
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { notes?: string },
  ) {
    const result = await this.backup.restoreFromBackup(id, userId);
    return ApiResponse.success(result, result.status === 'SUCCESS' ? 'Restore completed' : 'Restore failed');
  }

  /** GET /ops/backups/restores/list — List restore logs */
  @Get('restores/list')
  async listRestores(@Query('limit') limit?: string) {
    const data = await this.backup.listRestores(limit ? Number(limit) : 20);
    return ApiResponse.success(data);
  }

  /** POST /ops/backups/cleanup — Delete expired backups from R2 */
  @Post('cleanup')
  async cleanup() {
    const result = await this.backup.cleanupExpiredBackups();
    return ApiResponse.success(result, `Deleted ${result.deleted} expired backups`);
  }

  /** GET /ops/backups/status/pg-dump — Check if pg_dump is available */
  @Get('status/pg-dump')
  async pgDumpStatus() {
    return ApiResponse.success({ available: this.backup.isPgDumpAvailable() });
  }
}
