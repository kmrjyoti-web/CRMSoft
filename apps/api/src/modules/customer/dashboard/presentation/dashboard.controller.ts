import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { GetExecutiveDashboardQuery } from '../application/queries/get-executive-dashboard/get-executive-dashboard.query';
import { GetSalesPipelineQuery } from '../application/queries/get-sales-pipeline/get-sales-pipeline.query';
import { GetSalesFunnelQuery } from '../application/queries/get-sales-funnel/get-sales-funnel.query';
import { GetMyDashboardQuery } from '../application/queries/get-my-dashboard/get-my-dashboard.query';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('executive')
  @RequirePermissions('dashboard:read')
  async executive(@Query() q: DashboardQueryDto) {
    const result = await this.queryBus.execute(
      new GetExecutiveDashboardQuery(new Date(q.dateFrom), new Date(q.dateTo), q.userId),
    );
    return ApiResponse.success(result);
  }

  @Get('pipeline')
  @RequirePermissions('dashboard:read')
  async pipeline(@Query() q: DashboardQueryDto) {
    const result = await this.queryBus.execute(
      new GetSalesPipelineQuery(
        q.dateFrom ? new Date(q.dateFrom) : undefined,
        q.dateTo ? new Date(q.dateTo) : undefined,
        q.userId,
      ),
    );
    return ApiResponse.success(result);
  }

  @Get('funnel')
  @RequirePermissions('dashboard:read')
  async funnel(@Query() q: DashboardQueryDto) {
    const result = await this.queryBus.execute(
      new GetSalesFunnelQuery(new Date(q.dateFrom), new Date(q.dateTo), q.userId),
    );
    return ApiResponse.success(result);
  }

  @Get('my')
  @RequirePermissions('dashboard:read')
  async myDashboard(@CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(new GetMyDashboardQuery(userId));
    return ApiResponse.success(result);
  }
}
