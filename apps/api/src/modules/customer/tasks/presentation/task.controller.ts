import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ChangeTaskStatusDto } from './dto/change-task-status.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { BulkAssignTaskDto } from './dto/bulk-assign-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { CreateTaskCommand } from '../application/commands/create-task/create-task.command';
import { UpdateTaskCommand } from '../application/commands/update-task/update-task.command';
import { ChangeTaskStatusCommand } from '../application/commands/change-task-status/change-task-status.command';
import { AssignTaskCommand } from '../application/commands/assign-task/assign-task.command';
import { AddWatcherCommand } from '../application/commands/add-watcher/add-watcher.command';
import { RemoveWatcherCommand } from '../application/commands/remove-watcher/remove-watcher.command';
import { DeleteTaskCommand } from '../application/commands/delete-task/delete-task.command';
import { BulkAssignTaskCommand } from '../application/commands/bulk-assign-task/bulk-assign-task.command';
import { CompleteTaskCommand } from '../application/commands/complete-task/complete-task.command';
import { ApproveTaskCommand } from '../application/commands/approve-task/approve-task.command';
import { RejectTaskCommand } from '../application/commands/reject-task/reject-task.command';
import { GetTaskListQuery } from '../application/queries/get-task-list/get-task-list.query';
import { GetTaskByIdQuery } from '../application/queries/get-task-by-id/get-task-by-id.query';
import { GetMyTasksQuery } from '../application/queries/get-my-tasks/get-my-tasks.query';
import { GetTaskStatsQuery } from '../application/queries/get-task-stats/get-task-stats.query';
import { GetTaskHistoryQuery } from '../application/queries/get-task-history/get-task-history.query';
import { GetMyTasksDashboardQuery } from '../application/queries/get-my-tasks-dashboard/get-my-tasks-dashboard.query';
import { GetTeamTasksOverviewQuery } from '../application/queries/get-team-tasks-overview/get-team-tasks-overview.query';

@Controller('tasks')
export class TaskController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @RequirePermissions('tasks:create')
  async create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new CreateTaskCommand(
        dto.title, user.id, user.roleLevel ?? 5, user.tenantId ?? '',
        dto.assignedToId, dto.description, dto.type, dto.customTaskType, dto.priority,
        dto.assignmentScope, dto.assignedDepartmentId, dto.assignedDesignationId, dto.assignedRoleId,
        dto.dueDate ? new Date(dto.dueDate) : undefined, dto.dueTime,
        dto.startDate ? new Date(dto.startDate) : undefined,
        dto.recurrence, dto.recurrenceConfig, dto.parentTaskId,
        dto.entityType, dto.entityId, dto.tags, dto.attachments, dto.customFields, dto.estimatedMinutes,
        dto.reminderMinutesBefore, dto.activityType, dto.leadId,
      ),
    );
    return ApiResponse.success(result, 'Task created');
  }

  @Post('bulk-assign')
  @RequirePermissions('tasks:update')
  async bulkAssign(@Body() dto: BulkAssignTaskDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new BulkAssignTaskCommand(dto.taskIds, dto.assignedToId, user.id, user.roleLevel ?? 5, user.tenantId ?? ''),
    );
    return ApiResponse.success(result, 'Tasks reassigned');
  }

  @Get()
  @RequirePermissions('tasks:read')
  async list(@Query() query: TaskQueryDto, @CurrentUser() user: any) {
    const result = await this.queryBus.execute(
      new GetTaskListQuery(
        user.id, user.roleLevel ?? 5, user.tenantId ?? '',
        +(query.page || 1), +(query.limit || 20),
        query.status, query.priority, query.assignedToId, query.search,
        query.sortBy || 'createdAt', query.sortOrder || 'desc',
      ),
    );
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('my')
  @RequirePermissions('tasks:read')
  async myTasks(@CurrentUser('id') userId: string, @Query('page') page = 1, @Query('limit') limit = 20, @Query('status') status?: string) {
    const result = await this.queryBus.execute(new GetMyTasksQuery(userId, +page, +limit, status));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('my/dashboard')
  @RequirePermissions('tasks:read')
  async myDashboard(@CurrentUser() user: any) {
    const result = await this.queryBus.execute(new GetMyTasksDashboardQuery(user.id, user.tenantId ?? ''));
    return ApiResponse.success(result);
  }

  @Get('team/overview')
  @RequirePermissions('tasks:read')
  async teamOverview(@CurrentUser() user: any) {
    const result = await this.queryBus.execute(
      new GetTeamTasksOverviewQuery(user.id, user.roleLevel ?? 5, user.tenantId ?? ''),
    );
    return ApiResponse.success(result);
  }

  @Get('stats')
  @RequirePermissions('tasks:read')
  async stats(@CurrentUser() user: any) {
    const result = await this.queryBus.execute(new GetTaskStatsQuery(user.id, user.roleLevel ?? 5, user.tenantId ?? ''));
    return ApiResponse.success(result);
  }

  @Get(':id')
  @RequirePermissions('tasks:read')
  async getById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.queryBus.execute(new GetTaskByIdQuery(id, userId));
    return ApiResponse.success(result);
  }

  @Put(':id')
  @RequirePermissions('tasks:update')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(
      new UpdateTaskCommand(id, userId, dto.title, dto.description, dto.priority, dto.dueDate ? new Date(dto.dueDate) : undefined, dto.recurrence),
    );
    return ApiResponse.success(result, 'Task updated');
  }

  @Post(':id/status')
  @RequirePermissions('tasks:update')
  async changeStatus(@Param('id') id: string, @Body() dto: ChangeTaskStatusDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new ChangeTaskStatusCommand(id, dto.status, userId, dto.reason));
    return ApiResponse.success(result, 'Task status updated');
  }

  @Post(':id/complete')
  @RequirePermissions('tasks:update')
  async complete(@Param('id') id: string, @Body() dto: CompleteTaskDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new CompleteTaskCommand(id, userId, dto.completionNotes, dto.actualMinutes));
    return ApiResponse.success(result, 'Task completed');
  }

  @Post(':id/assign')
  @RequirePermissions('tasks:update')
  async assign(@Param('id') id: string, @Body('assignedToId') assignedToId: string, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new AssignTaskCommand(id, assignedToId, user.id, user.roleLevel ?? 5));
    return ApiResponse.success(result, 'Task reassigned');
  }

  @Post(':id/watchers')
  @RequirePermissions('tasks:update')
  async addWatcher(@Param('id') id: string, @Body('userId') watcherUserId: string) {
    const result = await this.commandBus.execute(new AddWatcherCommand(id, watcherUserId));
    return ApiResponse.success(result, 'Watcher added');
  }

  @Delete(':id/watchers/:uid')
  @RequirePermissions('tasks:update')
  async removeWatcher(@Param('id') id: string, @Param('uid') uid: string) {
    const result = await this.commandBus.execute(new RemoveWatcherCommand(id, uid));
    return ApiResponse.success(result, 'Watcher removed');
  }

  @Post(':id/approve')
  @RequirePermissions('tasks:update')
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new ApproveTaskCommand(id, user.id, user.tenantId ?? ''));
    return ApiResponse.success(result, 'Task approved');
  }

  @Post(':id/reject')
  @RequirePermissions('tasks:update')
  async reject(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new RejectTaskCommand(id, userId, reason));
    return ApiResponse.success(result, 'Task rejected');
  }

  @Get(':id/history')
  @RequirePermissions('tasks:read')
  async getHistory(@Param('id') id: string, @Query('page') page = 1, @Query('limit') limit = 50) {
    const result = await this.queryBus.execute(new GetTaskHistoryQuery(id, +page, +limit));
    return ApiResponse.success(result);
  }

  @Delete(':id')
  @RequirePermissions('tasks:delete')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new DeleteTaskCommand(id, userId));
    return ApiResponse.success(result, 'Task deleted');
  }
}
