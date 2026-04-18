import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { CreateTargetDto, UpdateTargetDto } from './dto/target.dto';
import { GetTeamPerformanceQuery } from '../application/queries/get-team-performance/get-team-performance.query';
import { GetLeaderboardQuery } from '../application/queries/get-leaderboard/get-leaderboard.query';
import { GetTargetTrackingQuery } from '../application/queries/get-target-tracking/get-target-tracking.query';
import { CreateTargetCommand } from '../application/commands/create-target/create-target.command';
import { UpdateTargetCommand } from '../application/commands/update-target/update-target.command';
import { DeleteTargetCommand } from '../application/commands/delete-target/delete-target.command';

@Controller('performance')
@UseGuards(JwtAuthGuard)
export class PerformanceController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get('team')
  @RequirePermissions('performance:read')
  async team(@Query() q: DashboardQueryDto) {
    const result = await this.queryBus.execute(
      new GetTeamPerformanceQuery(new Date(q.dateFrom), new Date(q.dateTo), q.roleId),
    );
    return ApiResponse.success(result);
  }

  @Get('leaderboard')
  @RequirePermissions('performance:read')
  async leaderboard(@Query() q: DashboardQueryDto, @CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(
      new GetLeaderboardQuery(new Date(q.dateFrom), new Date(q.dateTo), q.metric || 'score', 10, userId),
    );
    return ApiResponse.success(result);
  }

  @Get('target-tracking')
  @RequirePermissions('performance:read')
  async targetTracking(@Query() q: DashboardQueryDto) {
    const result = await this.queryBus.execute(
      new GetTargetTrackingQuery(q.period, q.dateFrom ? new Date(q.dateFrom) : undefined, q.dateTo ? new Date(q.dateTo) : undefined),
    );
    return ApiResponse.success(result);
  }

  @Post('targets')
  @RequirePermissions('performance:manage-targets')
  async createTarget(@Body() dto: CreateTargetDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new CreateTargetCommand(dto.metric, dto.targetValue, dto.period, new Date(dto.periodStart), new Date(dto.periodEnd), userId, dto.userId, dto.roleId, dto.name, dto.notes),
    );
    return ApiResponse.success(result, 'Target created');
  }

  @Get('targets')
  @RequirePermissions('performance:read')
  async listTargets() {
    const result = await this.queryBus.execute(new GetTargetTrackingQuery());
    return ApiResponse.success(result);
  }

  @Put('targets/:id')
  @RequirePermissions('performance:manage-targets')
  async updateTarget(@Param('id') id: string, @Body() dto: UpdateTargetDto) {
    const result = await this.commandBus.execute(
      new UpdateTargetCommand(id, dto.targetValue, dto.name, dto.notes),
    );
    return ApiResponse.success(result, 'Target updated');
  }

  @Delete('targets/:id')
  @RequirePermissions('performance:manage-targets')
  async deleteTarget(@Param('id') id: string) {
    const result = await this.commandBus.execute(new DeleteTargetCommand(id));
    return ApiResponse.success(result, 'Target deleted');
  }
}
