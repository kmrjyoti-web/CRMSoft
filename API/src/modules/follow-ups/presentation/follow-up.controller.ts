import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { SnoozeFollowUpDto } from './dto/snooze-follow-up.dto';
import { ReassignFollowUpDto } from './dto/reassign-follow-up.dto';
import { FollowUpQueryDto } from './dto/follow-up-query.dto';
import { CreateFollowUpCommand } from '../application/commands/create-follow-up/create-follow-up.command';
import { UpdateFollowUpCommand } from '../application/commands/update-follow-up/update-follow-up.command';
import { CompleteFollowUpCommand } from '../application/commands/complete-follow-up/complete-follow-up.command';
import { SnoozeFollowUpCommand } from '../application/commands/snooze-follow-up/snooze-follow-up.command';
import { ReassignFollowUpCommand } from '../application/commands/reassign-follow-up/reassign-follow-up.command';
import { DeleteFollowUpCommand } from '../application/commands/delete-follow-up/delete-follow-up.command';
import { GetFollowUpListQuery } from '../application/queries/get-follow-up-list/get-follow-up-list.query';
import { GetFollowUpByIdQuery } from '../application/queries/get-follow-up-by-id/get-follow-up-by-id.query';
import { GetOverdueFollowUpsQuery } from '../application/queries/get-overdue-follow-ups/get-overdue-follow-ups.query';
import { GetFollowUpStatsQuery } from '../application/queries/get-follow-up-stats/get-follow-up-stats.query';

@Controller('follow-ups')
export class FollowUpController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @RequirePermissions('follow-ups:create')
  async create(@Body() dto: CreateFollowUpDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new CreateFollowUpCommand(dto.title, new Date(dto.dueDate), dto.assignedToId, userId, dto.entityType, dto.entityId, dto.description, dto.priority),
    );
    return ApiResponse.success(result, 'Follow-up created');
  }

  @Get()
  @RequirePermissions('follow-ups:read')
  async list(@Query() query: FollowUpQueryDto) {
    const result = await this.queryBus.execute(
      new GetFollowUpListQuery(query.page, query.limit, query.sortBy, query.sortOrder, query.search, query.priority, query.assignedToId, query.isOverdue, query.entityType, query.entityId),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('overdue')
  @RequirePermissions('follow-ups:read')
  async overdue(@Query('assignedToId') assignedToId?: string, @Query('page') page = 1, @Query('limit') limit = 50) {
    const result = await this.queryBus.execute(new GetOverdueFollowUpsQuery(assignedToId, +page, +limit));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('stats')
  @RequirePermissions('follow-ups:read')
  async stats(@Query('userId') userId?: string, @Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string) {
    const result = await this.queryBus.execute(new GetFollowUpStatsQuery(userId, fromDate, toDate));
    return ApiResponse.success(result);
  }

  @Get(':id')
  @RequirePermissions('follow-ups:read')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetFollowUpByIdQuery(id));
    return ApiResponse.success(result);
  }

  @Put(':id')
  @RequirePermissions('follow-ups:update')
  async update(@Param('id') id: string, @Body() dto: UpdateFollowUpDto, @CurrentUser('id') userId: string) {
    const data = { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined };
    const result = await this.commandBus.execute(new UpdateFollowUpCommand(id, userId, data));
    return ApiResponse.success(result, 'Follow-up updated');
  }

  @Post(':id/complete')
  @RequirePermissions('follow-ups:update')
  async complete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CompleteFollowUpCommand(id, userId));
    return ApiResponse.success(result, 'Follow-up completed');
  }

  @Post(':id/snooze')
  @RequirePermissions('follow-ups:update')
  async snooze(@Param('id') id: string, @Body() dto: SnoozeFollowUpDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new SnoozeFollowUpCommand(id, userId, new Date(dto.snoozedUntil)));
    return ApiResponse.success(result, 'Follow-up snoozed');
  }

  @Post(':id/reassign')
  @RequirePermissions('follow-ups:update')
  async reassign(@Param('id') id: string, @Body() dto: ReassignFollowUpDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new ReassignFollowUpCommand(id, userId, dto.newAssigneeId));
    return ApiResponse.success(result, 'Follow-up reassigned');
  }

  @Delete(':id')
  @RequirePermissions('follow-ups:delete')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new DeleteFollowUpCommand(id, userId));
    return ApiResponse.success(result, 'Follow-up deleted');
  }
}
