import {
  Controller, Get, Post, Patch, Delete,
  Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../infrastructure/vendor.guard';
import { ApiResponse } from '../../../common/utils/api-response';
import { ErrorLoggerService } from '../../../common/errors/error-logger.service';
import { ErrorCatalogService } from '../../../common/errors/error-catalog.service';
import { ErrorAutoReportService } from '../../../common/errors/error-auto-report.service';

@ApiTags('Error Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('admin/error-logs')
export class VendorErrorLogsController {
  constructor(
    private readonly errorLoggerService: ErrorLoggerService,
    private readonly errorCatalogService: ErrorCatalogService,
    private readonly autoReportService: ErrorAutoReportService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List recent error logs with filtering' })
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('errorCode') errorCode?: string,
    @Query('tenantId') tenantId?: string,
    @Query('layer') layer?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const result = await this.errorLoggerService.getRecent({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      errorCode,
      tenantId,
      layer,
      severity,
      status,
      dateFrom,
      dateTo,
    });
    return ApiResponse.success(result);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get error trends over time for charts' })
  async getTrends(
    @Query('tenantId') tenantId?: string,
    @Query('days') days?: number,
  ) {
    const result = await this.errorLoggerService.getTrends({
      tenantId,
      days: days ? +days : undefined,
    });
    return ApiResponse.success(result);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get error statistics for dashboard' })
  async getStats(
    @Query('tenantId') tenantId?: string,
    @Query('since') since?: string,
  ) {
    const sinceDate = since ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = await this.errorLoggerService.getStats({ tenantId, since: sinceDate });

    return ApiResponse.success({
      total24h: result.total,
      bySeverity: result.bySeverity,
      byCode: result.byCode,
      errorRate: 0,
      trend: 0,
    });
  }

  @Get('auto-report-rules')
  @ApiOperation({ summary: 'List auto-report rules' })
  async listAutoReportRules(@Query('tenantId') tenantId?: string) {
    const rules = await this.autoReportService.listRules(tenantId);
    return ApiResponse.success(rules);
  }

  @Post('auto-report-rules')
  @ApiOperation({ summary: 'Create auto-report rule' })
  async createAutoReportRule(
    @Body() body: {
      name: string;
      severity: string;
      channels: string[];
      tenantId?: string;
      emailRecipients?: string[];
      slackWebhookUrl?: string;
      whatsappNumbers?: string[];
      throttleMinutes?: number;
      isActive?: boolean;
    },
  ) {
    const rule = await this.autoReportService.createRule(body);
    return ApiResponse.success(rule);
  }

  @Get('trace/:traceId')
  @ApiOperation({ summary: 'Get error logs by trace/request ID' })
  async getByTraceId(@Param('traceId') traceId: string) {
    const result = await this.errorLoggerService.getByTraceId(traceId);
    return ApiResponse.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single error log detail' })
  async getById(@Param('id') id: string) {
    const result = await this.errorLoggerService.getById(id);
    if (!result) {
      return ApiResponse.error('Error log not found');
    }
    return ApiResponse.success(result);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve an error log' })
  async resolve(
    @Param('id') id: string,
    @Body() body: { resolution: string; resolvedById: string },
  ) {
    const result = await this.errorLoggerService.resolve(id, {
      resolvedById: body.resolvedById,
      resolution: body.resolution,
    });
    return ApiResponse.success(result);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign an error log to a team member' })
  async assign(
    @Param('id') id: string,
    @Body() body: { assignedToId: string; assignedToName: string },
  ) {
    const result = await this.errorLoggerService.assign(id, {
      assignedToId: body.assignedToId,
      assignedToName: body.assignedToName,
    });
    return ApiResponse.success(result);
  }

  @Post(':id/ignore')
  @ApiOperation({ summary: 'Mark an error log as ignored' })
  async ignore(@Param('id') id: string) {
    const result = await this.errorLoggerService.ignore(id);
    return ApiResponse.success(result);
  }

  @Patch('auto-report-rules/:ruleId')
  @ApiOperation({ summary: 'Update auto-report rule' })
  async updateAutoReportRule(
    @Param('ruleId') ruleId: string,
    @Body() body: Partial<{
      name: string;
      severity: string;
      channels: string[];
      emailRecipients: string[];
      slackWebhookUrl: string;
      whatsappNumbers: string[];
      throttleMinutes: number;
      isActive: boolean;
    }>,
  ) {
    const rule = await this.autoReportService.updateRule(ruleId, body);
    return ApiResponse.success(rule);
  }

  @Delete('auto-report-rules/:ruleId')
  @ApiOperation({ summary: 'Delete auto-report rule' })
  async deleteAutoReportRule(@Param('ruleId') ruleId: string) {
    await this.autoReportService.deleteRule(ruleId);
    return ApiResponse.success({ deleted: true });
  }
}
