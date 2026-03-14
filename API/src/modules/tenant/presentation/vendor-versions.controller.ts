import {
  Controller, Get, Post, Put, Delete,
  Param, Query, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { VersionControlService } from '../services/version-control.service';
import { IndustryPatchingService } from '../services/industry-patching.service';
import { RollbackEngineService } from '../services/rollback-engine.service';
import { NotionDocsService } from '../services/notion-docs.service';

@ApiTags('Version Control')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/versions')
export class VendorVersionsController {
  constructor(
    private readonly versionService: VersionControlService,
    private readonly patchingService: IndustryPatchingService,
    private readonly rollbackService: RollbackEngineService,
    private readonly notionService: NotionDocsService,
  ) {}

  // ── Versions ──

  @Get()
  @ApiOperation({ summary: 'List all versions' })
  async listVersions(
    @Query('status') status?: string,
    @Query('releaseType') releaseType?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.versionService.listVersions({
      status, releaseType, search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get version statistics' })
  async getStats() {
    const stats = await this.versionService.getStats();
    return ApiResponse.success(stats);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get version by ID' })
  async getVersion(@Param('id') id: string) {
    const version = await this.versionService.getById(id);
    return ApiResponse.success(version);
  }

  @Post()
  @ApiOperation({ summary: 'Create new version' })
  async createVersion(@Body() body: {
    version: string;
    codeName?: string;
    releaseType?: string;
    changelog?: any[];
    breakingChanges?: any[];
    migrationNotes?: string;
    modulesUpdated?: string[];
    schemaChanges?: any;
    gitBranch?: string;
  }) {
    const version = await this.versionService.create(body);
    return ApiResponse.success(version, 'Version created');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update version' })
  async updateVersion(@Param('id') id: string, @Body() body: any) {
    const version = await this.versionService.update(id, body);
    return ApiResponse.success(version, 'Version updated');
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish version' })
  async publishVersion(@Param('id') id: string, @CurrentUser() user: any) {
    const version = await this.versionService.publish(id, user.email || user.id);
    return ApiResponse.success(version, 'Version published');
  }

  @Post(':id/rollback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rollback version' })
  async rollbackVersion(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('reason') reason: string,
  ) {
    const version = await this.versionService.rollback(id, reason || 'Manual rollback', user.email || user.id);
    return ApiResponse.success(version, 'Version rolled back');
  }

  // ── Industry Patches ──

  @Get(':id/patches')
  @ApiOperation({ summary: 'List patches for a version' })
  async listPatches(
    @Param('id') versionId: string,
    @Query('industryCode') industryCode?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.patchingService.listPatches({
      versionId, industryCode, status,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Post(':id/patches')
  @ApiOperation({ summary: 'Create industry patch' })
  async createPatch(
    @Param('id') versionId: string,
    @Body() body: {
      industryCode: string;
      patchName: string;
      description?: string;
      schemaChanges?: any;
      seedData?: any;
      configOverrides?: any;
      menuOverrides?: any;
      forceUpdate?: boolean;
    },
  ) {
    const patch = await this.patchingService.create({ ...body, versionId });
    return ApiResponse.success(patch, 'Patch created');
  }

  @Post('patches/:patchId/apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply an industry patch' })
  async applyPatch(@Param('patchId') patchId: string, @CurrentUser() user: any) {
    const patch = await this.patchingService.applyPatch(patchId, user.email || user.id);
    return ApiResponse.success(patch, 'Patch applied');
  }

  @Post('patches/:patchId/rollback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rollback an industry patch' })
  async rollbackPatch(@Param('patchId') patchId: string) {
    const patch = await this.patchingService.rollbackPatch(patchId);
    return ApiResponse.success(patch, 'Patch rolled back');
  }

  // ── Backups ──

  @Get(':id/backups')
  @ApiOperation({ summary: 'List backups for a version' })
  async listBackups(
    @Param('id') versionId: string,
    @Query('backupType') backupType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.rollbackService.listBackups({
      versionId, backupType,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Post(':id/backups')
  @ApiOperation({ summary: 'Create manual backup' })
  async createBackup(@Param('id') versionId: string, @Body() body: {
    backupType?: string;
    dbDumpPath?: string;
    configSnapshot?: any;
    schemaSnapshot?: string;
  }) {
    const backup = await this.rollbackService.createBackup({ ...body, versionId });
    return ApiResponse.success(backup, 'Backup created');
  }

  @Post('backups/:backupId/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore from backup' })
  async restoreBackup(@Param('backupId') backupId: string, @CurrentUser() user: any) {
    const backup = await this.rollbackService.restoreBackup(backupId, user.email || user.id);
    return ApiResponse.success(backup, 'Backup restored');
  }

  @Delete('backups/:backupId')
  @ApiOperation({ summary: 'Delete a backup' })
  async deleteBackup(@Param('backupId') backupId: string) {
    await this.rollbackService.deleteBackup(backupId);
    return ApiResponse.success(null, 'Backup deleted');
  }

  // ── Notion ──

  @Post(':id/notion/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish release notes to Notion' })
  async publishToNotion(@Param('id') id: string) {
    const pageId = await this.notionService.publishReleaseNotes(id);
    return ApiResponse.success({ notionPageId: pageId }, pageId ? 'Published to Notion' : 'Notion not configured');
  }

  @Get('notion/status')
  @ApiOperation({ summary: 'Check Notion integration status' })
  async notionStatus() {
    const status = await this.notionService.getStatus();
    return ApiResponse.success(status);
  }
}

// Separate controller for tenant-facing force update check (no VendorGuard)
@ApiTags('Tenant Version')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenant')
export class TenantForceUpdateController {
  constructor(private readonly versionService: VersionControlService) {}

  @Get('force-update-check')
  @ApiOperation({ summary: 'Check if tenant has pending force updates' })
  async checkForceUpdate(@CurrentUser() user: any) {
    const tenantId = user.tenantId;
    if (!tenantId) {
      return ApiResponse.success({ pending: false, message: '', deadline: null });
    }
    const result = await this.versionService.checkForceUpdate(tenantId);
    return ApiResponse.success(result);
  }
}
