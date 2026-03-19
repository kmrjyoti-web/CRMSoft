import { Controller, Get, Put, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { NotificationConfigService } from '../services/notification-config.service';
import { EscalationService } from '../services/escalation.service';
import { QuietHourService, CreateQuietHourDto, UpdateQuietHourDto } from '../services/quiet-hour.service';
import { NotificationAnalyticsService } from '../services/notification-analytics.service';

@Controller('notification-configs')
export class NotificationAdminController {
  constructor(
    private readonly configService: NotificationConfigService,
    private readonly escalationService: EscalationService,
    private readonly quietHourService: QuietHourService,
    private readonly analyticsService: NotificationAnalyticsService,
  ) {}

  // ─── Notification Configs ───

  @Get()
  @RequirePermissions('settings:read')
  async getAllConfigs() {
    const result = await this.configService.getAllConfigs();
    return ApiResponse.success(result);
  }

  @Put(':eventType')
  @RequirePermissions('settings:update')
  async upsertConfig(@Param('eventType') eventType: string, @Body() body: { channels: string[]; templateId?: string }) {
    const result = await this.configService.upsertConfig(eventType, body.channels, body.templateId);
    return ApiResponse.success(result, 'Config updated');
  }

  // ─── Escalation Rules ───

  @Get('escalation-rules')
  @RequirePermissions('settings:read')
  async getAllRules() {
    const result = await this.escalationService.getAllRules();
    return ApiResponse.success(result);
  }

  @Post('escalation-rules')
  @RequirePermissions('settings:update')
  async createRule(@Body() body: { entityType: string; triggerAfterHours: number; action: string; targetRoleLevel?: number }) {
    const result = await this.escalationService.createRule(body);
    return ApiResponse.success(result, 'Rule created');
  }

  @Put('escalation-rules/:id')
  @RequirePermissions('settings:update')
  async updateRule(@Param('id') id: string, @Body() body: any) {
    const result = await this.escalationService.updateRule(id, body);
    return ApiResponse.success(result, 'Rule updated');
  }

  @Delete('escalation-rules/:id')
  @RequirePermissions('settings:update')
  async deleteRule(@Param('id') id: string) {
    const result = await this.escalationService.deleteRule(id);
    return ApiResponse.success(result, 'Rule deleted');
  }

  // ─── Quiet Hours ───

  @Get('quiet-hours')
  @RequirePermissions('settings:read')
  async getAllQuietHours() {
    const result = await this.quietHourService.listConfigs();
    return ApiResponse.success(result);
  }

  @Post('quiet-hours')
  @RequirePermissions('settings:update')
  async createQuietHour(@Body() body: CreateQuietHourDto) {
    const result = await this.quietHourService.createConfig(body);
    return ApiResponse.success(result, 'Quiet hour config created');
  }

  @Put('quiet-hours/:id')
  @RequirePermissions('settings:update')
  async updateQuietHour(@Param('id') id: string, @Body() body: UpdateQuietHourDto) {
    const result = await this.quietHourService.updateConfig(id, body);
    return ApiResponse.success(result, 'Quiet hour config updated');
  }

  @Delete('quiet-hours/:id')
  @RequirePermissions('settings:update')
  async deleteQuietHour(@Param('id') id: string) {
    const result = await this.quietHourService.deleteConfig(id);
    return ApiResponse.success(result, 'Quiet hour config deleted');
  }

  // ─── Analytics ───

  @Get('analytics')
  @RequirePermissions('settings:read')
  async getAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    const result = await this.analyticsService.getAnalytics('', start, end);
    return ApiResponse.success(result);
  }
}
