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
exports.ScheduledTestController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_scheduled_test_command_1 = require("../application/commands/create-scheduled-test/create-scheduled-test.command");
const update_scheduled_test_command_1 = require("../application/commands/update-scheduled-test/update-scheduled-test.command");
const delete_scheduled_test_command_1 = require("../application/commands/delete-scheduled-test/delete-scheduled-test.command");
const trigger_scheduled_test_command_1 = require("../application/commands/trigger-scheduled-test/trigger-scheduled-test.command");
const list_scheduled_tests_query_1 = require("../application/queries/list-scheduled-tests/list-scheduled-tests.query");
const get_scheduled_test_query_1 = require("../application/queries/get-scheduled-test/get-scheduled-test.query");
const list_scheduled_test_runs_query_1 = require("../application/queries/list-scheduled-test-runs/list-scheduled-test-runs.query");
let ScheduledTestController = class ScheduledTestController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(tenantId, userId, body) {
        const result = await this.commandBus.execute(new create_scheduled_test_command_1.CreateScheduledTestCommand(tenantId, userId, body.name, body.cronExpression, body.targetModules, body.testTypes, body.description, body.dbSourceType));
        return api_response_1.ApiResponse.success(result, 'Scheduled test created');
    }
    async list(tenantId, isActive, page = 1, limit = 20) {
        const active = isActive !== undefined ? isActive === 'true' : undefined;
        const data = await this.queryBus.execute(new list_scheduled_tests_query_1.ListScheduledTestsQuery(tenantId, active, page, limit));
        return api_response_1.ApiResponse.success(data);
    }
    async getById(id, tenantId) {
        const data = await this.queryBus.execute(new get_scheduled_test_query_1.GetScheduledTestQuery(id, tenantId));
        return api_response_1.ApiResponse.success(data);
    }
    async update(id, tenantId, body) {
        const result = await this.commandBus.execute(new update_scheduled_test_command_1.UpdateScheduledTestCommand(id, tenantId, body.name, body.description, body.cronExpression, body.targetModules, body.testTypes, body.dbSourceType, body.isActive));
        return api_response_1.ApiResponse.success(result, 'Scheduled test updated');
    }
    async delete(id, tenantId) {
        await this.commandBus.execute(new delete_scheduled_test_command_1.DeleteScheduledTestCommand(id, tenantId));
        return api_response_1.ApiResponse.success(null, 'Scheduled test deleted');
    }
    async trigger(id, tenantId, userId) {
        const result = await this.commandBus.execute(new trigger_scheduled_test_command_1.TriggerScheduledTestCommand(id, tenantId, userId));
        return api_response_1.ApiResponse.success(result, 'Scheduled test triggered');
    }
    async getRuns(id, tenantId, limit = 20) {
        const data = await this.queryBus.execute(new list_scheduled_test_runs_query_1.ListScheduledTestRunsQuery(id, tenantId, limit));
        return api_response_1.ApiResponse.success(data);
    }
};
exports.ScheduledTestController = ScheduledTestController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ScheduledTestController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('isActive')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ScheduledTestController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ScheduledTestController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ScheduledTestController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ScheduledTestController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/trigger'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ScheduledTestController.prototype, "trigger", null);
__decorate([
    (0, common_1.Get)(':id/runs'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], ScheduledTestController.prototype, "getRuns", null);
exports.ScheduledTestController = ScheduledTestController = __decorate([
    (0, common_1.Controller)('ops/scheduled-test'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('ops:manage'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], ScheduledTestController);
//# sourceMappingURL=scheduled-test.controller.js.map