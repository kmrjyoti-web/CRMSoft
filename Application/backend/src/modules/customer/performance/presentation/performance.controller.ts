import { Controller, Post, Get, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';
import { TargetQueryDto } from './dto/target-query.dto';
import { CreateTargetCommand } from '../application/commands/create-target/create-target.command';
import { UpdateTargetCommand } from '../application/commands/update-target/update-target.command';
import { DeleteTargetCommand } from '../application/commands/delete-target/delete-target.command';
import { ListTargetsQuery } from '../application/queries/list-targets/list-targets.query';
import { GetTargetQuery } from '../application/queries/get-target/get-target.query';
import { GetLeaderboardQuery } from '../application/queries/get-leaderboard/get-leaderboard.query';
import { GetTeamPerformanceQuery } from '../application/queries/get-team-performance/get-team-performance.query';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get('targets')
  @RequirePermissions('performance:read')
  async listTargets(@Query() query: TargetQueryDto) {
    const result = await this.queryBus.execute(
      new ListTargetsQuery(query.page, query.limit, query.sortBy, query.sortOrder, query.userId, query.period as any, query.metric as any, query.isActive),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('targets/:id')
  @RequirePermissions('performance:read')
  async getTarget(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetTargetQuery(id));
    return ApiResponse.success(result);
  }

  @Post('targets')
  @RequirePermissions('performance:create')
  async createTarget(@Body() dto: CreateTargetDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new CreateTargetCommand(userId, dto.metric, dto.targetValue, dto.period, dto.periodStart, dto.periodEnd, dto.name, dto.userId, dto.roleId, dto.notes),
    );
    return ApiResponse.success(result, 'Target created');
  }

  @Patch('targets/:id')
  @RequirePermissions('performance:update')
  async updateTarget(@Param('id') id: string, @Body() dto: UpdateTargetDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new UpdateTargetCommand(id, userId, dto as any));
    return ApiResponse.success(result, 'Target updated');
  }

  @Delete('targets/:id')
  @RequirePermissions('performance:delete')
  async deleteTarget(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new DeleteTargetCommand(id, userId));
    return ApiResponse.success(result, 'Target deleted');
  }

  @Get('leaderboard')
  @RequirePermissions('performance:read')
  async getLeaderboard(@Query('period') period?: string, @Query('limit') limit?: number) {
    const result = await this.queryBus.execute(new GetLeaderboardQuery(period, limit ? Number(limit) : undefined));
    return ApiResponse.success(result);
  }

  @Get('team')
  @RequirePermissions('performance:read')
  async getTeamPerformance(@Query('period') period?: string) {
    const result = await this.queryBus.execute(new GetTeamPerformanceQuery(period));
    return ApiResponse.success(result);
  }

  @Get('tracking/:userId')
  @RequirePermissions('performance:read')
  async trackingByUser(@Param('userId') userId: string, @Query() query: TargetQueryDto) {
    const result = await this.queryBus.execute(
      new ListTargetsQuery(query.page, query.limit, query.sortBy, query.sortOrder, userId, query.period as any, query.metric as any, query.isActive),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }
}
