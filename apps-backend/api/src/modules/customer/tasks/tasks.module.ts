import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TaskLogicModule } from '../../customer/task-logic/task-logic.module';
import { TaskController } from './presentation/task.controller';
import { TaskAssignmentService } from './application/services/task-assignment.service';
import { TaskVisibilityService } from './application/services/task-visibility.service';
import { TaskRecurrenceService } from './application/services/task-recurrence.service';
import { CreateTaskHandler } from './application/commands/create-task/create-task.handler';
import { UpdateTaskHandler } from './application/commands/update-task/update-task.handler';
import { ChangeTaskStatusHandler } from './application/commands/change-task-status/change-task-status.handler';
import { AssignTaskHandler } from './application/commands/assign-task/assign-task.handler';
import { AddWatcherHandler } from './application/commands/add-watcher/add-watcher.handler';
import { RemoveWatcherHandler } from './application/commands/remove-watcher/remove-watcher.handler';
import { DeleteTaskHandler } from './application/commands/delete-task/delete-task.handler';
import { BulkAssignTaskHandler } from './application/commands/bulk-assign-task/bulk-assign-task.handler';
import { CompleteTaskHandler } from './application/commands/complete-task/complete-task.handler';
import { ApproveTaskHandler } from './application/commands/approve-task/approve-task.handler';
import { RejectTaskHandler } from './application/commands/reject-task/reject-task.handler';
import { GetTaskListHandler } from './application/queries/get-task-list/get-task-list.handler';
import { GetTaskByIdHandler } from './application/queries/get-task-by-id/get-task-by-id.handler';
import { GetMyTasksHandler } from './application/queries/get-my-tasks/get-my-tasks.handler';
import { GetTaskStatsHandler } from './application/queries/get-task-stats/get-task-stats.handler';
import { GetTaskHistoryHandler } from './application/queries/get-task-history/get-task-history.handler';
import { GetMyTasksDashboardHandler } from './application/queries/get-my-tasks-dashboard/get-my-tasks-dashboard.handler';
import { GetTeamTasksOverviewHandler } from './application/queries/get-team-tasks-overview/get-team-tasks-overview.handler';

const CommandHandlers = [
  CreateTaskHandler, UpdateTaskHandler, ChangeTaskStatusHandler,
  AssignTaskHandler, AddWatcherHandler, RemoveWatcherHandler, DeleteTaskHandler,
  BulkAssignTaskHandler, CompleteTaskHandler,
  ApproveTaskHandler, RejectTaskHandler,
];

const QueryHandlers = [
  GetTaskListHandler, GetTaskByIdHandler, GetMyTasksHandler,
  GetTaskStatsHandler, GetTaskHistoryHandler,
  GetMyTasksDashboardHandler, GetTeamTasksOverviewHandler,
];

@Module({
  imports: [CqrsModule, TaskLogicModule],
  controllers: [TaskController],
  providers: [
    TaskAssignmentService, TaskVisibilityService, TaskRecurrenceService,
    ...CommandHandlers, ...QueryHandlers,
  ],
  exports: [TaskAssignmentService, TaskVisibilityService, TaskRecurrenceService],
})
export class TasksModule {}
