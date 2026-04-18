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
exports.TestRunnerController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_test_run_dto_1 = require("./dto/create-test-run.dto");
const create_test_run_command_1 = require("../application/commands/create-test-run/create-test-run.command");
const rerun_failed_tests_command_1 = require("../application/commands/rerun-failed-tests/rerun-failed-tests.command");
const cancel_test_run_command_1 = require("../application/commands/cancel-test-run/cancel-test-run.command");
const list_test_runs_query_1 = require("../application/queries/list-test-runs/list-test-runs.query");
const get_test_run_query_1 = require("../application/queries/get-test-run/get-test-run.query");
const get_test_results_query_1 = require("../application/queries/get-test-results/get-test-results.query");
const get_test_results_tree_query_1 = require("../application/queries/get-test-results-tree/get-test-results-tree.query");
const compare_test_runs_query_1 = require("../application/queries/compare-test-runs/compare-test-runs.query");
const get_test_dashboard_query_1 = require("../application/queries/get-test-dashboard/get-test-dashboard.query");
let TestRunnerController = class TestRunnerController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async getDashboard(tenantId, days = 30) {
        const data = await this.queryBus.execute(new get_test_dashboard_query_1.GetTestDashboardQuery(tenantId, days));
        return api_response_1.ApiResponse.success(data);
    }
    async runAutoTests(tenantId, userId, dto) {
        const result = await this.commandBus.execute(new create_test_run_command_1.CreateTestRunCommand(tenantId, userId, dto.testTypes ?? [], dto.targetModules ?? [], 'AUTO', dto.testEnvId));
        return api_response_1.ApiResponse.success(result, 'Test run queued');
    }
    async runSelectiveTests(tenantId, userId, dto) {
        const result = await this.commandBus.execute(new create_test_run_command_1.CreateTestRunCommand(tenantId, userId, dto.testTypes ?? [], dto.targetModules ?? [], 'MANUAL', dto.testEnvId));
        return api_response_1.ApiResponse.success(result, 'Selective test run queued');
    }
    async list(tenantId, status, page = 1, limit = 20) {
        const data = await this.queryBus.execute(new list_test_runs_query_1.ListTestRunsQuery(tenantId, { status, page, limit }));
        return api_response_1.ApiResponse.success(data);
    }
    async compareRuns(runId1, runId2) {
        const data = await this.queryBus.execute(new compare_test_runs_query_1.CompareTestRunsQuery(runId1, runId2));
        return api_response_1.ApiResponse.success(data);
    }
    async getById(id) {
        const data = await this.queryBus.execute(new get_test_run_query_1.GetTestRunQuery(id));
        return api_response_1.ApiResponse.success(data);
    }
    async getResults(testRunId, testType, status, module, page = 1, limit = 50) {
        const data = await this.queryBus.execute(new get_test_results_query_1.GetTestResultsQuery(testRunId, { testType, status, module, page, limit }));
        return api_response_1.ApiResponse.success(data);
    }
    async getResultsTree(testRunId) {
        const data = await this.queryBus.execute(new get_test_results_tree_query_1.GetTestResultsTreeQuery(testRunId));
        return api_response_1.ApiResponse.success(data);
    }
    async rerunFailed(testRunId, tenantId, userId) {
        const result = await this.commandBus.execute(new rerun_failed_tests_command_1.RerunFailedTestsCommand(tenantId, userId, testRunId));
        return api_response_1.ApiResponse.success(result, 'Re-run of failed tests queued');
    }
    async cancel(testRunId) {
        const result = await this.commandBus.execute(new cancel_test_run_command_1.CancelTestRunCommand(testRunId));
        return api_response_1.ApiResponse.success(result, 'Test run cancelled');
    }
};
exports.TestRunnerController = TestRunnerController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('days', new common_1.DefaultValuePipe(30), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], TestRunnerController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('auto'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_test_run_dto_1.CreateTestRunDto]),
    __metadata("design:returntype", Promise)
], TestRunnerController.prototype, "runAutoTests", null);
__decorate([
    (0, common_1.Post)('selective'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_test_run_dto_1.CreateTestRunDto]),
    __metadata("design:returntype", Promise)
], TestRunnerController.prototype, "runSelectiveTests", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], TestRunnerController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('compare/:runId1/:runId2'),
    __param(0, (0, common_1.Param)('runId1', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('runId2', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TestRunnerController.prototype, "compareRuns", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestRunnerController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(':id/results'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('testType')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('module')),
    __param(4, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(5, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], TestRunnerController.prototype, "getResults", null);
__decorate([
    (0, common_1.Get)(':id/tree'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestRunnerController.prototype, "getResultsTree", null);
__decorate([
    (0, common_1.Post)(':id/rerun-failed'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TestRunnerController.prototype, "rerunFailed", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestRunnerController.prototype, "cancel", null);
exports.TestRunnerController = TestRunnerController = __decorate([
    (0, common_1.Controller)('ops/test-run'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('ops:manage'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], TestRunnerController);
//# sourceMappingURL=test-runner.controller.js.map