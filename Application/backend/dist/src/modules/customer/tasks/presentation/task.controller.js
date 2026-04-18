"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_task_dto_1 = require("./dto/create-task.dto");
const update_task_dto_1 = require("./dto/update-task.dto");
const change_task_status_dto_1 = require("./dto/change-task-status.dto");
const task_query_dto_1 = require("./dto/task-query.dto");
const bulk_assign_task_dto_1 = require("./dto/bulk-assign-task.dto");
const complete_task_dto_1 = require("./dto/complete-task.dto");
const create_task_command_1 = require("../application/commands/create-task/create-task.command");
const update_task_command_1 = require("../application/commands/update-task/update-task.command");
const change_task_status_command_1 = require("../application/commands/change-task-status/change-task-status.command");
const assign_task_command_1 = require("../application/commands/assign-task/assign-task.command");
const add_watcher_command_1 = require("../application/commands/add-watcher/add-watcher.command");
const remove_watcher_command_1 = require("../application/commands/remove-watcher/remove-watcher.command");
const delete_task_command_1 = require("../application/commands/delete-task/delete-task.command");
const bulk_assign_task_command_1 = require("../application/commands/bulk-assign-task/bulk-assign-task.command");
const complete_task_command_1 = require("../application/commands/complete-task/complete-task.command");
const approve_task_command_1 = require("../application/commands/approve-task/approve-task.command");
const reject_task_command_1 = require("../application/commands/reject-task/reject-task.command");
const get_task_list_query_1 = require("../application/queries/get-task-list/get-task-list.query");
const get_task_by_id_query_1 = require("../application/queries/get-task-by-id/get-task-by-id.query");
const get_my_tasks_query_1 = require("../application/queries/get-my-tasks/get-my-tasks.query");
const get_task_stats_query_1 = require("../application/queries/get-task-stats/get-task-stats.query");
const get_task_history_query_1 = require("../application/queries/get-task-history/get-task-history.query");
const get_my_tasks_dashboard_query_1 = require("../application/queries/get-my-tasks-dashboard/get-my-tasks-dashboard.query");
const get_team_tasks_overview_query_1 = require("../application/queries/get-team-tasks-overview/get-team-tasks-overview.query");
let TaskController = class TaskController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, user) {
        const result = await this.commandBus.execute(new create_task_command_1.CreateTaskCommand(dto.title, user.id, user.roleLevel ?? 5, user.tenantId ?? '', dto.assignedToId, dto.description, dto.type, dto.customTaskType, dto.priority, dto.assignmentScope, dto.assignedDepartmentId, dto.assignedDesignationId, dto.assignedRoleId, dto.dueDate ? new Date(dto.dueDate) : undefined, dto.dueTime, dto.startDate ? new Date(dto.startDate) : undefined, dto.recurrence, dto.recurrenceConfig, dto.parentTaskId, dto.entityType, dto.entityId, dto.tags, dto.attachments, dto.customFields, dto.estimatedMinutes, dto.reminderMinutesBefore, dto.activityType, dto.leadId));
        return api_response_1.ApiResponse.success(result, 'Task created');
    }
    async bulkAssign(dto, user) {
        const result = await this.commandBus.execute(new bulk_assign_task_command_1.BulkAssignTaskCommand(dto.taskIds, dto.assignedToId, user.id, user.roleLevel ?? 5, user.tenantId ?? ''));
        return api_response_1.ApiResponse.success(result, 'Tasks reassigned');
    }
    async list(query, user) {
        const result = await this.queryBus.execute(new get_task_list_query_1.GetTaskListQuery(user.id, user.roleLevel ?? 5, user.tenantId ?? '', +(query.page || 1), +(query.limit || 20), query.status, query.priority, query.assignedToId, query.search, query.sortBy || 'createdAt', query.sortOrder || 'desc'));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async myTasks(userId, page = 1, limit = 20, status) {
        const result = await this.queryBus.execute(new get_my_tasks_query_1.GetMyTasksQuery(userId, +page, +limit, status));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async myDashboard(user) {
        const result = await this.queryBus.execute(new get_my_tasks_dashboard_query_1.GetMyTasksDashboardQuery(user.id, user.tenantId ?? ''));
        return api_response_1.ApiResponse.success(result);
    }
    async teamOverview(user) {
        const result = await this.queryBus.execute(new get_team_tasks_overview_query_1.GetTeamTasksOverviewQuery(user.id, user.roleLevel ?? 5, user.tenantId ?? ''));
        return api_response_1.ApiResponse.success(result);
    }
    async stats(user) {
        const result = await this.queryBus.execute(new get_task_stats_query_1.GetTaskStatsQuery(user.id, user.roleLevel ?? 5, user.tenantId ?? ''));
        return api_response_1.ApiResponse.success(result);
    }
    async getById(id, userId) {
        const result = await this.queryBus.execute(new get_task_by_id_query_1.GetTaskByIdQuery(id, userId));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto, userId) {
        const result = await this.commandBus.execute(new update_task_command_1.UpdateTaskCommand(id, userId, dto.title, dto.description, dto.priority, dto.dueDate ? new Date(dto.dueDate) : undefined, dto.recurrence));
        return api_response_1.ApiResponse.success(result, 'Task updated');
    }
    async changeStatus(id, dto, userId) {
        const result = await this.commandBus.execute(new change_task_status_command_1.ChangeTaskStatusCommand(id, dto.status, userId, dto.reason));
        return api_response_1.ApiResponse.success(result, 'Task status updated');
    }
    async complete(id, dto, userId) {
        const result = await this.commandBus.execute(new complete_task_command_1.CompleteTaskCommand(id, userId, dto.completionNotes, dto.actualMinutes));
        return api_response_1.ApiResponse.success(result, 'Task completed');
    }
    async assign(id, assignedToId, user) {
        const result = await this.commandBus.execute(new assign_task_command_1.AssignTaskCommand(id, assignedToId, user.id, user.roleLevel ?? 5));
        return api_response_1.ApiResponse.success(result, 'Task reassigned');
    }
    async addWatcher(id, watcherUserId) {
        const result = await this.commandBus.execute(new add_watcher_command_1.AddWatcherCommand(id, watcherUserId));
        return api_response_1.ApiResponse.success(result, 'Watcher added');
    }
    async removeWatcher(id, uid) {
        const result = await this.commandBus.execute(new remove_watcher_command_1.RemoveWatcherCommand(id, uid));
        return api_response_1.ApiResponse.success(result, 'Watcher removed');
    }
    async approve(id, user) {
        const result = await this.commandBus.execute(new approve_task_command_1.ApproveTaskCommand(id, user.id, user.tenantId ?? ''));
        return api_response_1.ApiResponse.success(result, 'Task approved');
    }
    async reject(id, reason, userId) {
        const result = await this.commandBus.execute(new reject_task_command_1.RejectTaskCommand(id, userId, reason));
        return api_response_1.ApiResponse.success(result, 'Task rejected');
    }
    async getHistory(id, page = 1, limit = 50) {
        const result = await this.queryBus.execute(new get_task_history_query_1.GetTaskHistoryQuery(id, +page, +limit));
        return api_response_1.ApiResponse.success(result);
    }
    async delete(id, userId) {
        const result = await this.commandBus.execute(new delete_task_command_1.DeleteTaskCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Task deleted');
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk-assign'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_assign_task_dto_1.BulkAssignTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "bulkAssign", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_query_dto_1.TaskQueryDto, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "myTasks", null);
__decorate([
    (0, common_1.Get)('my/dashboard'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "myDashboard", null);
__decorate([
    (0, common_1.Get)('team/overview'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "teamOverview", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_task_dto_1.UpdateTaskDto, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/status'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_task_status_dto_1.ChangeTaskStatusDto, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, complete_task_dto_1.CompleteTaskDto, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('assignedToId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/watchers'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "addWatcher", null);
__decorate([
    (0, common_1.Delete)(':id/watchers/:uid'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('uid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "removeWatcher", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('tasks:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "delete", null);
exports.TaskController = TaskController = __decorate([
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], TaskController);
//# sourceMappingURL=task.controller.js.map