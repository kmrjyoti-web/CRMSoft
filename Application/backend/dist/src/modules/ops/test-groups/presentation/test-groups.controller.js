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
exports.TestGroupsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_test_group_dto_1 = require("./dto/create-test-group.dto");
const create_test_group_command_1 = require("../application/commands/create-test-group/create-test-group.command");
const update_test_group_command_1 = require("../application/commands/update-test-group/update-test-group.command");
const delete_test_group_command_1 = require("../application/commands/delete-test-group/delete-test-group.command");
const run_test_group_command_1 = require("../application/commands/run-test-group/run-test-group.command");
const list_test_groups_query_1 = require("../application/queries/list-test-groups/list-test-groups.query");
const get_test_group_query_1 = require("../application/queries/get-test-group/get-test-group.query");
const list_group_executions_query_1 = require("../application/queries/list-group-executions/list-group-executions.query");
const get_group_execution_query_1 = require("../application/queries/get-group-execution/get-group-execution.query");
const ASSERTION_OPERATORS = [
    { code: 'eq', label: 'Equals', example: 'status eq 200' },
    { code: 'neq', label: 'Not equals', example: 'status neq 500' },
    { code: 'gt', label: 'Greater than', example: 'body.data.count gt 0' },
    { code: 'gte', label: 'Greater or equal', example: 'body.data.total gte 100' },
    { code: 'lt', label: 'Less than', example: 'duration lt 5000' },
    { code: 'lte', label: 'Less or equal', example: 'body.data.score lte 10' },
    { code: 'exists', label: 'Exists (not null)', example: 'body.data.id exists' },
    { code: 'not_exists', label: 'Does not exist', example: 'body.error not_exists' },
    { code: 'contains', label: 'Contains string', example: 'body.data.name contains "Test"' },
    { code: 'matches', label: 'Regex match', example: 'body.data.email matches "@example.com"' },
    { code: 'in', label: 'In array', example: 'status in [200, 201]' },
    { code: 'type', label: 'Type check', example: 'body.data type "object"' },
];
let TestGroupsController = class TestGroupsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(tenantId, userId, dto) {
        const data = await this.commandBus.execute(new create_test_group_command_1.CreateTestGroupCommand(tenantId, userId, dto));
        return api_response_1.ApiResponse.success(data, 'Test group created');
    }
    async list(tenantId, status, module) {
        const data = await this.queryBus.execute(new list_test_groups_query_1.ListTestGroupsQuery(tenantId, { status, module }));
        return api_response_1.ApiResponse.success(data);
    }
    async getOperators() {
        return api_response_1.ApiResponse.success(ASSERTION_OPERATORS);
    }
    async getExecution(executionId) {
        const data = await this.queryBus.execute(new get_group_execution_query_1.GetGroupExecutionQuery(executionId));
        return api_response_1.ApiResponse.success(data);
    }
    async getById(id) {
        const data = await this.queryBus.execute(new get_test_group_query_1.GetTestGroupQuery(id));
        return api_response_1.ApiResponse.success(data);
    }
    async update(id, dto) {
        const data = await this.commandBus.execute(new update_test_group_command_1.UpdateTestGroupCommand(id, dto));
        return api_response_1.ApiResponse.success(data, 'Test group updated');
    }
    async delete(id) {
        const data = await this.commandBus.execute(new delete_test_group_command_1.DeleteTestGroupCommand(id));
        return api_response_1.ApiResponse.success(data, 'Test group deleted');
    }
    async run(groupId, tenantId, userId, body) {
        const data = await this.commandBus.execute(new run_test_group_command_1.RunTestGroupCommand(tenantId, userId, groupId, body.testEnvId));
        return api_response_1.ApiResponse.success(data, 'Test group execution started');
    }
    async listExecutions(groupId) {
        const data = await this.queryBus.execute(new list_group_executions_query_1.ListGroupExecutionsQuery(groupId));
        return api_response_1.ApiResponse.success(data);
    }
};
exports.TestGroupsController = TestGroupsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_test_group_dto_1.CreateTestGroupDto]),
    __metadata("design:returntype", Promise)
], TestGroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('module')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TestGroupsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('meta/operators'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestGroupsController.prototype, "getOperators", null);
__decorate([
    (0, common_1.Get)('execution/:executionId'),
    __param(0, (0, common_1.Param)('executionId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestGroupsController.prototype, "getExecution", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestGroupsController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_test_group_dto_1.UpdateTestGroupDto]),
    __metadata("design:returntype", Promise)
], TestGroupsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestGroupsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/run'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TestGroupsController.prototype, "run", null);
__decorate([
    (0, common_1.Get)(':id/executions'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestGroupsController.prototype, "listExecutions", null);
exports.TestGroupsController = TestGroupsController = __decorate([
    (0, common_1.Controller)('ops/test-groups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('ops:manage'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], TestGroupsController);
//# sourceMappingURL=test-groups.controller.js.map