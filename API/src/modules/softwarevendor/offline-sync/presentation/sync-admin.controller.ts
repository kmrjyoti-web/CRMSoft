import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Prisma } from '@prisma/client';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { SyncEngineService } from '../services/sync-engine.service';
import { FlushService } from '../services/flush.service';
import { SyncAnalyticsService } from '../services/sync-analytics.service';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { CreateWarningRuleDto } from './dto/create-warning-rule.dto';
import { UpdateWarningRuleDto } from './dto/update-warning-rule.dto';
import { IssueFlushDto } from './dto/issue-flush.dto';
import { SyncQueryDto } from './dto/sync-query.dto';

@ApiTags('Sync Admin')
@ApiBearerAuth()
@Controller('admin/sync')
@UseGuards(AuthGuard('jwt'))
export class SyncAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly syncEngine: SyncEngineService,
    private readonly flushService: FlushService,
    private readonly analyticsService: SyncAnalyticsService,
  ) {}

  // ── POLICIES ──

  @Get('policies')
  @ApiOperation({ summary: 'List all sync policies' })
  async listPolicies() {
    const policies = await this.prisma.syncPolicy.findMany({
      include: { warningRules: true },
      orderBy: { syncPriority: 'asc' },
    });
    return ApiResponse.success(policies, 'Sync policies retrieved');
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get policy detail' })
  async getPolicy(@Param('id') id: string) {
    const policy = await this.prisma.syncPolicy.findUnique({
      where: { id },
      include: { warningRules: true },
    });
    return ApiResponse.success(policy, 'Policy retrieved');
  }

  @Put('policies/:id')
  @ApiOperation({ summary: 'Update sync policy (direction, frequency, limits)' })
  async updatePolicy(
    @Param('id') id: string,
    @Body() dto: UpdatePolicyDto,
    @CurrentUser() user: any,
  ) {
    const policy = await this.prisma.syncPolicy.update({
      where: { id },
      data: {
        ...(dto.direction !== undefined && { direction: dto.direction as any }),
        ...(dto.syncIntervalMinutes !== undefined && { syncIntervalMinutes: dto.syncIntervalMinutes }),
        ...(dto.maxRowsOffline !== undefined && { maxRowsOffline: dto.maxRowsOffline }),
        ...(dto.maxStorageMb !== undefined && { maxStorageMb: dto.maxStorageMb }),
        ...(dto.maxDataAgeDays !== undefined && { maxDataAgeDays: dto.maxDataAgeDays }),
        ...(dto.conflictStrategy !== undefined && { conflictStrategy: dto.conflictStrategy as any }),
        ...(dto.downloadScope !== undefined && { downloadScope: dto.downloadScope }),
        ...(dto.downloadFilter !== undefined && { downloadFilter: dto.downloadFilter === null ? Prisma.JsonNull : dto.downloadFilter }),
        ...(dto.syncPriority !== undefined && { syncPriority: dto.syncPriority }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        updatedById: user.id,
        updatedByName: `${user.firstName} ${user.lastName}`,
      },
    });
    return ApiResponse.success(policy, 'Policy updated');
  }

  @Post('policies/:id/toggle')
  @ApiOperation({ summary: 'Enable or disable entity sync' })
  async togglePolicy(@Param('id') id: string, @CurrentUser() user: any) {
    const existing = await this.prisma.syncPolicy.findUnique({ where: { id } });
    const policy = await this.prisma.syncPolicy.update({
      where: { id },
      data: {
        isEnabled: !existing?.isEnabled,
        updatedById: user.id,
        updatedByName: `${user.firstName} ${user.lastName}`,
      },
    });
    return ApiResponse.success(policy, `Policy ${policy.isEnabled ? 'enabled' : 'disabled'}`);
  }

  // ── WARNING RULES ──

  @Post('warning-rules')
  @ApiOperation({ summary: 'Create a warning rule' })
  async createWarningRule(@Body() dto: CreateWarningRuleDto) {
    const rule = await this.prisma.syncWarningRule.create({
      data: {
        policyId: dto.policyId,
        name: dto.name,
        description: dto.description,
        trigger: dto.trigger as any,
        thresholdValue: dto.thresholdValue,
        thresholdUnit: dto.thresholdUnit,
        level1Action: (dto.level1Action as any) || 'WARN_ONLY',
        level1Threshold: dto.level1Threshold,
        level1Message: dto.level1Message,
        level2Action: dto.level2Action as any,
        level2Threshold: dto.level2Threshold,
        level2Message: dto.level2Message,
        level2DelayMinutes: dto.level2DelayMinutes,
        level3Action: dto.level3Action as any,
        level3Threshold: dto.level3Threshold,
        level3Message: dto.level3Message,
        appliesToRoles: dto.appliesToRoles || [],
        appliesToUsers: dto.appliesToUsers || [],
        priority: dto.priority || 5,
      },
    });
    return ApiResponse.success(rule, 'Warning rule created');
  }

  @Get('warning-rules')
  @ApiOperation({ summary: 'List warning rules' })
  async listWarningRules() {
    const rules = await this.prisma.syncWarningRule.findMany({
      include: { policy: true },
      orderBy: { priority: 'asc' },
    });
    return ApiResponse.success(rules, 'Warning rules retrieved');
  }

  @Put('warning-rules/:id')
  @ApiOperation({ summary: 'Update a warning rule' })
  async updateWarningRule(
    @Param('id') id: string,
    @Body() dto: UpdateWarningRuleDto,
  ) {
    const updateData: Record<string, any> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.trigger !== undefined) updateData.trigger = dto.trigger;
    if (dto.thresholdValue !== undefined) updateData.thresholdValue = dto.thresholdValue;
    if (dto.thresholdUnit !== undefined) updateData.thresholdUnit = dto.thresholdUnit;
    if (dto.level1Action !== undefined) updateData.level1Action = dto.level1Action;
    if (dto.level1Threshold !== undefined) updateData.level1Threshold = dto.level1Threshold;
    if (dto.level1Message !== undefined) updateData.level1Message = dto.level1Message;
    if (dto.level2Action !== undefined) updateData.level2Action = dto.level2Action;
    if (dto.level2Threshold !== undefined) updateData.level2Threshold = dto.level2Threshold;
    if (dto.level2Message !== undefined) updateData.level2Message = dto.level2Message;
    if (dto.level2DelayMinutes !== undefined) updateData.level2DelayMinutes = dto.level2DelayMinutes;
    if (dto.level3Action !== undefined) updateData.level3Action = dto.level3Action;
    if (dto.level3Threshold !== undefined) updateData.level3Threshold = dto.level3Threshold;
    if (dto.level3Message !== undefined) updateData.level3Message = dto.level3Message;
    if (dto.appliesToRoles !== undefined) updateData.appliesToRoles = dto.appliesToRoles;
    if (dto.appliesToUsers !== undefined) updateData.appliesToUsers = dto.appliesToUsers;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.isEnabled !== undefined) updateData.isEnabled = dto.isEnabled;

    const rule = await this.prisma.syncWarningRule.update({
      where: { id },
      data: updateData,
    });
    return ApiResponse.success(rule, 'Warning rule updated');
  }

  @Delete('warning-rules/:id')
  @ApiOperation({ summary: 'Delete a warning rule' })
  async deleteWarningRule(@Param('id') id: string) {
    await this.prisma.syncWarningRule.delete({ where: { id } });
    return ApiResponse.success(null, 'Warning rule deleted');
  }

  // ── FLUSH & CONTROL ──

  @Post('flush')
  @ApiOperation({ summary: 'Issue a remote flush command' })
  async issueFlush(
    @Body() dto: IssueFlushDto,
    @CurrentUser() user: any,
  ) {
    const command = await this.flushService.issueFlush({
      flushType: dto.flushType as any,
      targetUserId: dto.targetUserId,
      targetDeviceId: dto.targetDeviceId,
      targetEntity: dto.targetEntity,
      reason: dto.reason,
      redownloadAfter: dto.redownloadAfter,
      issuedById: user.id,
      issuedByName: `${user.firstName} ${user.lastName}`,
    });
    return ApiResponse.success(command, 'Flush command issued');
  }

  @Get('flush-commands')
  @ApiOperation({ summary: 'List flush command history' })
  async listFlushCommands(
    @Query('targetUserId') targetUserId?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.flushService.getFlushCommands({ targetUserId, status });
    return ApiResponse.success(result.data, 'Flush commands retrieved');
  }

  @Get('devices')
  @ApiOperation({ summary: 'List all devices and their sync status' })
  async listDevices(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    const devices = await this.syncEngine.getDevices({ userId, status });
    return ApiResponse.success(devices, 'Devices retrieved');
  }

  @Post('devices/:id/block')
  @ApiOperation({ summary: 'Block a device from syncing' })
  async blockDevice(@Param('id') id: string) {
    await this.syncEngine.blockDevice(id);
    return ApiResponse.success(null, 'Device blocked');
  }

  // ── DASHBOARD ──

  @Get('dashboard')
  @ApiOperation({ summary: 'Sync health overview dashboard' })
  async getDashboard() {
    const dashboard = await this.analyticsService.getDashboard();
    return ApiResponse.success(dashboard, 'Sync dashboard retrieved');
  }

  @Get('audit')
  @ApiOperation({ summary: 'Sync audit log' })
  async getAuditLog(@Query() query: SyncQueryDto) {
    const result = await this.analyticsService.getAuditLog({
      userId: query.userId,
      deviceId: query.deviceId,
      action: query.action,
      entityName: query.entityName,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      page: query.page,
      limit: query.limit,
    });
    return ApiResponse.paginated(result.data, result.total, query.page || 1, query.limit || 20);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Sync frequency, conflict rates, performance metrics' })
  async getAnalytics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const analytics = await this.analyticsService.getAnalytics(
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
    return ApiResponse.success(analytics, 'Sync analytics retrieved');
  }
}
