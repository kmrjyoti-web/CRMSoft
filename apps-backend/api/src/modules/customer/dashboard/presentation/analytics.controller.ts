import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { GetActivityHeatmapQuery } from '../application/queries/get-activity-heatmap/get-activity-heatmap.query';
import { GetRevenueAnalyticsQuery } from '../application/queries/get-revenue-analytics/get-revenue-analytics.query';
import { GetLeadSourceAnalysisQuery } from '../application/queries/get-lead-source-analysis/get-lead-source-analysis.query';
import { GetLostReasonAnalysisQuery } from '../application/queries/get-lost-reason-analysis/get-lost-reason-analysis.query';
import { GetAgingAnalysisQuery } from '../application/queries/get-aging-analysis/get-aging-analysis.query';
import { GetVelocityMetricsQuery } from '../application/queries/get-velocity-metrics/get-velocity-metrics.query';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('activity-heatmap')
  @RequirePermissions('analytics:read')
  async heatmap(@Query() q: DashboardQueryDto) {
    const result = await this.queryBus.execute(
      new GetActivityHeatmapQuery(new Date(q.dateFrom), new Date(q.dateTo), q.userId, q.activityType),
    );
    return ApiResponse.success(result);
  }

  @Get('revenue')
  @RequirePermissions('analytics:read')
  async revenue(@Query() q: DashboardQueryDto) {
    const result = await this.queryBus.execute(
      new GetRevenueAnalyticsQuery(new Date(q.dateFrom), new Date(q.dateTo), q.groupBy),
    );
    return ApiResponse.success(result);
  }

  @Get('lead-sources')
  @RequirePermissions('analytics:read')
  async leadSources(@Query() q: DashboardQueryDto) {
    const result = await this.queryBus.execute(
      new GetLeadSourceAnalysisQuery(new Date(q.dateFrom), new Date(q.dateTo)),
    );
    return ApiResponse.success(result);
  }

  @Get('lost-reasons')
  @RequirePermissions('analytics:read')
  async lostReasons(@Query() q: DashboardQueryDto) {
    const result = await this.queryBus.execute(
      new GetLostReasonAnalysisQuery(new Date(q.dateFrom), new Date(q.dateTo)),
    );
    return ApiResponse.success(result);
  }

  @Get('aging')
  @RequirePermissions('analytics:read')
  async aging(@Query() q: DashboardQueryDto) {
    const result = await this.queryBus.execute(new GetAgingAnalysisQuery(q.userId));
    return ApiResponse.success(result);
  }

  @Get('velocity')
  @RequirePermissions('analytics:read')
  async velocity(@Query() q: DashboardQueryDto) {
    const result = await this.queryBus.execute(
      new GetVelocityMetricsQuery(new Date(q.dateFrom), new Date(q.dateTo)),
    );
    return ApiResponse.success(result);
  }
}
