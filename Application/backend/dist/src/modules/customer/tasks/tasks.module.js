"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const task_logic_module_1 = require("../../customer/task-logic/task-logic.module");
const task_controller_1 = require("./presentation/task.controller");
const task_assignment_service_1 = require("./application/services/task-assignment.service");
const task_visibility_service_1 = require("./application/services/task-visibility.service");
const task_recurrence_service_1 = require("./application/services/task-recurrence.service");
const create_task_handler_1 = require("./application/commands/create-task/create-task.handler");
const update_task_handler_1 = require("./application/commands/update-task/update-task.handler");
const change_task_status_handler_1 = require("./application/commands/change-task-status/change-task-status.handler");
const assign_task_handler_1 = require("./application/commands/assign-task/assign-task.handler");
const add_watcher_handler_1 = require("./application/commands/add-watcher/add-watcher.handler");
const remove_watcher_handler_1 = require("./application/commands/remove-watcher/remove-watcher.handler");
const delete_task_handler_1 = require("./application/commands/delete-task/delete-task.handler");
const bulk_assign_task_handler_1 = require("./application/commands/bulk-assign-task/bulk-assign-task.handler");
const complete_task_handler_1 = require("./application/commands/complete-task/complete-task.handler");
const approve_task_handler_1 = require("./application/commands/approve-task/approve-task.handler");
const reject_task_handler_1 = require("./application/commands/reject-task/reject-task.handler");
const get_task_list_handler_1 = require("./application/queries/get-task-list/get-task-list.handler");
const get_task_by_id_handler_1 = require("./application/queries/get-task-by-id/get-task-by-id.handler");
const get_my_tasks_handler_1 = require("./application/queries/get-my-tasks/get-my-tasks.handler");
const get_task_stats_handler_1 = require("./application/queries/get-task-stats/get-task-stats.handler");
const get_task_history_handler_1 = require("./application/queries/get-task-history/get-task-history.handler");
const get_my_tasks_dashboard_handler_1 = require("./application/queries/get-my-tasks-dashboard/get-my-tasks-dashboard.handler");
const get_team_tasks_overview_handler_1 = require("./application/queries/get-team-tasks-overview/get-team-tasks-overview.handler");
const CommandHandlers = [
    create_task_handler_1.CreateTaskHandler, update_task_handler_1.UpdateTaskHandler, change_task_status_handler_1.ChangeTaskStatusHandler,
    assign_task_handler_1.AssignTaskHandler, add_watcher_handler_1.AddWatcherHandler, remove_watcher_handler_1.RemoveWatcherHandler, delete_task_handler_1.DeleteTaskHandler,
    bulk_assign_task_handler_1.BulkAssignTaskHandler, complete_task_handler_1.CompleteTaskHandler,
    approve_task_handler_1.ApproveTaskHandler, reject_task_handler_1.RejectTaskHandler,
];
const QueryHandlers = [
    get_task_list_handler_1.GetTaskListHandler, get_task_by_id_handler_1.GetTaskByIdHandler, get_my_tasks_handler_1.GetMyTasksHandler,
    get_task_stats_handler_1.GetTaskStatsHandler, get_task_history_handler_1.GetTaskHistoryHandler,
    get_my_tasks_dashboard_handler_1.GetMyTasksDashboardHandler, get_team_tasks_overview_handler_1.GetTeamTasksOverviewHandler,
];
let TasksModule = class TasksModule {
};
exports.TasksModule = TasksModule;
exports.TasksModule = TasksModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, task_logic_module_1.TaskLogicModule],
        controllers: [task_controller_1.TaskController],
        providers: [
            task_assignment_service_1.TaskAssignmentService, task_visibility_service_1.TaskVisibilityService, task_recurrence_service_1.TaskRecurrenceService,
            ...CommandHandlers, ...QueryHandlers,
        ],
        exports: [task_assignment_service_1.TaskAssignmentService, task_visibility_service_1.TaskVisibilityService, task_recurrence_service_1.TaskRecurrenceService],
    })
], TasksModule);
//# sourceMappingURL=tasks.module.js.map