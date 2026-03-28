// @ts-nocheck
import {
  Controller, Get, Post, Patch, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';

import { CreateVersionCommand } from '../application/commands/create-version.command';
import { PublishVersionCommand } from '../application/commands/publish-version.command';
import { RollbackVersionCommand } from '../application/commands/rollback-version.command';
import { CreatePatchCommand } from '../application/commands/create-patch.command';
import { ListVersionsQuery } from '../application/queries/list-versions.query';
import { GetVersionQuery, GetCurrentVersionQuery } from '../application/queries/get-version.query';
import { CreateVersionDto, PublishVersionDto, RollbackVersionDto, CreatePatchDto } from './dto/create-version.dto';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@ApiTags('Version Control')
@ApiBearerAuth()
@Controller('vendor/versions')
export class VersionControlController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  // ── Versions ──────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new version (DRAFT)' })
  @RequirePermissions('versions:create')
  async create(@Body() dto: CreateVersionDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new CreateVersionCommand(dto.version, dto.releaseType, dto.changelog ?? [], dto.breakingChanges ?? [], dto.migrationNotes, dto.codeName, dto.gitBranch, user.id),
    );
    return ApiResponse.success(result, 'Version created');
  }

  @Get()
  @ApiOperation({ summary: 'List all versions' })
  @RequirePermissions('versions:read')
  async list(@Query('page') page = '1', @Query('limit') limit = '20', @Query('status') status?: string, @Query('releaseType') releaseType?: string) {
    const result = await this.queryBus.execute(new ListVersionsQuery(+page, +limit, status, releaseType));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current LIVE version' })
  @RequirePermissions('versions:read')
  async getCurrent() {
    const result = await this.queryBus.execute(new GetCurrentVersionQuery());
    return ApiResponse.success(result);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Version distribution stats (% of tenants per version)' })
  @RequirePermissions('versions:read')
  async stats() {
    const [total, byVersion] = await Promise.all([
      this.prisma.identity.tenantVersion.count({ where: { isActive: true, isDeleted: false } }),
      this.prisma.identity.tenantVersion.groupBy({
        by: ['currentVersion'],
        where: { isActive: true, isDeleted: false },
        _count: { _all: true },
      }),
    ]);
    const distribution = byVersion.map((r) => ({
      version: r.currentVersion,
      count: r._count._all,
      percent: total > 0 ? Math.round((r._count._all / total) * 100) : 0,
    }));
    return ApiResponse.success({ total, distribution });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get version detail' })
  @RequirePermissions('versions:read')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.queryBus.execute(new GetVersionQuery(id));
    return ApiResponse.success(result);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update version (DRAFT only)' })
  @RequirePermissions('versions:update')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateVersionDto>) {
    const result = await this.prisma.platform.appVersion.update({ where: { id }, data: dto as any });
    return ApiResponse.success(result, 'Version updated');
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish version (backup → live)' })
  @RequirePermissions('versions:publish')
  async publish(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PublishVersionDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new PublishVersionCommand(id, user.id, dto.gitTag, dto.gitCommitHash),
    );
    return ApiResponse.success(result, 'Version published');
  }

  @Post(':id/rollback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rollback to this version (backup current → restore target)' })
  @RequirePermissions('versions:rollback')
  async rollback(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RollbackVersionDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new RollbackVersionCommand(id, user.id, dto.rollbackReason),
    );
    return ApiResponse.success(result, 'Rollback complete');
  }

  // ── Patches ────────────────────────────────────────────────────────────────

  @Post(':versionId/patches')
  @ApiOperation({ summary: 'Create industry patch for this version' })
  @RequirePermissions('versions:create')
  async createPatch(@Param('versionId', ParseUUIDPipe) versionId: string, @Body() dto: CreatePatchDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new CreatePatchCommand(versionId, dto.industryCode, dto.patchName, dto.description, dto.schemaChanges, dto.configOverrides, dto.menuOverrides, dto.forceUpdate ?? false, user.id),
    );
    return ApiResponse.success(result, 'Patch created');
  }

  @Get(':versionId/patches')
  @ApiOperation({ summary: 'List patches for this version' })
  @RequirePermissions('versions:read')
  async listPatches(@Param('versionId', ParseUUIDPipe) versionId: string, @Query('industryCode') industryCode?: string) {
    const where: any = { versionId };
    if (industryCode) where.industryCode = industryCode;
    const patches = await this.prisma.platform.industryPatch.findMany({ where, orderBy: { createdAt: 'desc' } });
    return ApiResponse.success(patches);
  }

  @Post('patches/:patchId/apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply patch (mark as APPLIED)' })
  @RequirePermissions('versions:publish')
  async applyPatch(@Param('patchId', ParseUUIDPipe) patchId: string, @CurrentUser() user: any) {
    const patch = await this.prisma.platform.industryPatch.update({
      where: { id: patchId },
      data: { status: 'APPLIED', appliedAt: new Date(), appliedBy: user.id },
    });
    return ApiResponse.success(patch, 'Patch applied');
  }

  @Post('patches/:patchId/rollback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rollback patch' })
  @RequirePermissions('versions:rollback')
  async rollbackPatch(@Param('patchId', ParseUUIDPipe) patchId: string) {
    const patch = await this.prisma.platform.industryPatch.update({
      where: { id: patchId },
      data: { status: 'ROLLED_BACK' },
    });
    return ApiResponse.success(patch, 'Patch rolled back');
  }

  // ── Backups ────────────────────────────────────────────────────────────────

  @Get(':versionId/backups')
  @ApiOperation({ summary: 'List backups for this version' })
  @RequirePermissions('versions:read')
  async listBackups(@Param('versionId', ParseUUIDPipe) versionId: string) {
    const backups = await this.prisma.identity.versionBackup.findMany({
      where: { versionId },
      orderBy: { createdAt: 'desc' },
    });
    return ApiResponse.success(backups);
  }

  // ── Tenant Versions ────────────────────────────────────────────────────────

  @Get('tenant-versions/list')
  @ApiOperation({ summary: 'List tenant version assignments' })
  @RequirePermissions('versions:read')
  async tenantVersions(@Query('page') page = '1', @Query('limit') limit = '20') {
    const p = +page, l = +limit;
    const [data, total] = await Promise.all([
      this.prisma.identity.tenantVersion.findMany({
        where: { isDeleted: false },
        skip: (p - 1) * l,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.identity.tenantVersion.count({ where: { isDeleted: false } }),
    ]);
    return ApiResponse.paginated(data, total, p, l);
  }

  @Post('tenant-versions/force-update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger force update for tenants on old versions' })
  @RequirePermissions('versions:publish')
  async forceUpdate(@Body() body: { tenantIds?: string[]; message?: string; deadline?: string }) {
    const where: any = body.tenantIds?.length ? { tenantId: { in: body.tenantIds }, isDeleted: false } : { isDeleted: false };
    const { count } = await this.prisma.identity.tenantVersion.updateMany({
      where,
      data: {
        forceUpdatePending: true,
        forceUpdateMessage: body.message,
        forceUpdateDeadline: body.deadline ? new Date(body.deadline) : undefined,
      },
    });
    return ApiResponse.success({ tenantsUpdated: count }, 'Force update triggered');
  }
}
