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
exports.ManualTestController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const manual_test_log_dto_1 = require("./dto/manual-test-log.dto");
const log_manual_test_command_1 = require("../application/commands/log-manual-test/log-manual-test.command");
const get_screenshot_upload_url_command_1 = require("../application/commands/get-screenshot-upload-url/get-screenshot-upload-url.command");
const update_manual_test_log_command_1 = require("../application/commands/update-manual-test-log/update-manual-test-log.command");
const list_manual_test_logs_query_1 = require("../application/queries/list-manual-test-logs/list-manual-test-logs.query");
const get_manual_test_log_query_1 = require("../application/queries/get-manual-test-log/get-manual-test-log.query");
const get_manual_test_summary_query_1 = require("../application/queries/get-manual-test-summary/get-manual-test-summary.query");
const create_test_plan_command_1 = require("../application/commands/create-test-plan/create-test-plan.command");
const update_test_plan_command_1 = require("../application/commands/update-test-plan/update-test-plan.command");
const update_test_plan_item_command_1 = require("../application/commands/update-test-plan-item/update-test-plan-item.command");
const list_test_plans_query_1 = require("../application/queries/list-test-plans/list-test-plans.query");
const get_test_plan_query_1 = require("../application/queries/get-test-plan/get-test-plan.query");
let ManualTestController = class ManualTestController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async log(tenantId, userId, dto) {
        const data = await this.commandBus.execute(new log_manual_test_command_1.LogManualTestCommand(tenantId, userId, dto));
        return api_response_1.ApiResponse.success(data, 'Test log recorded');
    }
    async getUploadUrl(tenantId, dto) {
        const data = await this.commandBus.execute(new get_screenshot_upload_url_command_1.GetScreenshotUploadUrlCommand(tenantId, dto.contentType, dto.filename));
        return api_response_1.ApiResponse.success(data);
    }
    async getSummary(tenantId, testRunId, from, to) {
        const data = await this.queryBus.execute(new get_manual_test_summary_query_1.GetManualTestSummaryQuery(tenantId, { testRunId, from, to }));
        return api_response_1.ApiResponse.success(data);
    }
    async list(tenantId, testRunId, module, status, userId, page, limit) {
        const data = await this.queryBus.execute(new list_manual_test_logs_query_1.ListManualTestLogsQuery(tenantId, {
            testRunId,
            module,
            status,
            userId,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        }));
        return api_response_1.ApiResponse.success(data);
    }
    async getById(id) {
        const data = await this.queryBus.execute(new get_manual_test_log_query_1.GetManualTestLogQuery(id));
        return api_response_1.ApiResponse.success(data);
    }
    async update(id, dto) {
        const data = await this.commandBus.execute(new update_manual_test_log_command_1.UpdateManualTestLogCommand(id, dto));
        return api_response_1.ApiResponse.success(data, 'Test log updated');
    }
    async createPlan(tenantId, userId, body) {
        const data = await this.commandBus.execute(new create_test_plan_command_1.CreateTestPlanCommand(tenantId, userId, body.name, body.description, body.version, body.targetModules ?? [], body.items ?? []));
        return api_response_1.ApiResponse.success(data, 'Test plan created');
    }
    async listPlans(tenantId, status, search, page, limit) {
        const data = await this.queryBus.execute(new list_test_plans_query_1.ListTestPlansQuery(tenantId, status, search, page ? Number(page) : 1, limit ? Number(limit) : 20));
        return api_response_1.ApiResponse.success(data);
    }
    async getPlan(planId, tenantId) {
        const data = await this.queryBus.execute(new get_test_plan_query_1.GetTestPlanQuery(planId, tenantId));
        return api_response_1.ApiResponse.success(data);
    }
    async updatePlan(planId, tenantId, body) {
        const data = await this.commandBus.execute(new update_test_plan_command_1.UpdateTestPlanCommand(planId, tenantId, body.name, body.description, body.version, body.targetModules, body.status));
        return api_response_1.ApiResponse.success(data, 'Test plan updated');
    }
    async updatePlanItem(planId, itemId, tenantId, userId, body) {
        const data = await this.commandBus.execute(new update_test_plan_item_command_1.UpdateTestPlanItemCommand(itemId, planId, tenantId, userId, body.status, body.notes, body.errorDetails, body.priority, body.moduleName, body.componentName, body.functionality, body.layer));
        return api_response_1.ApiResponse.success(data, 'Item updated');
    }
};
exports.ManualTestController = ManualTestController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manual_test_log_dto_1.CreateManualTestLogDto]),
    __metadata("design:returntype", Promise)
], ManualTestController.prototype, "log", null);
__decorate([
    (0, common_1.Post)('upload-url'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manual_test_log_dto_1.GetUploadUrlDto]),
    __metadata("design:returntype", Promise)
], ManualTestController.prototype, "getUploadUrl", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('testRunId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ManualTestController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('testRunId')),
    __param(2, (0, common_1.Query)('module')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('userId')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ManualTestController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ManualTestController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manual_test_log_dto_1.UpdateManualTestLogDto]),
    __metadata("design:returntype", Promise)
], ManualTestController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('plans'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ManualTestController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Get)('plans'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ManualTestController.prototype, "listPlans", null);
__decorate([
    (0, common_1.Get)('plans/:planId'),
    __param(0, (0, common_1.Param)('planId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ManualTestController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Patch)('plans/:planId'),
    __param(0, (0, common_1.Param)('planId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ManualTestController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Patch)('plans/:planId/items/:itemId'),
    __param(0, (0, common_1.Param)('planId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('itemId', common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ManualTestController.prototype, "updatePlanItem", null);
exports.ManualTestController = ManualTestController = __decorate([
    (0, common_1.Controller)('ops/manual-test'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_permissions_decorator_1.RequirePermissions)('ops:manage'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], ManualTestController);
//# sourceMappingURL=manual-test.controller.js.map