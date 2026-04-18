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
exports.DemoController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_demo_dto_1 = require("./dto/create-demo.dto");
const update_demo_dto_1 = require("./dto/update-demo.dto");
const reschedule_demo_dto_1 = require("./dto/reschedule-demo.dto");
const complete_demo_dto_1 = require("./dto/complete-demo.dto");
const cancel_demo_dto_1 = require("./dto/cancel-demo.dto");
const demo_query_dto_1 = require("./dto/demo-query.dto");
const create_demo_command_1 = require("../application/commands/create-demo/create-demo.command");
const update_demo_command_1 = require("../application/commands/update-demo/update-demo.command");
const reschedule_demo_command_1 = require("../application/commands/reschedule-demo/reschedule-demo.command");
const complete_demo_command_1 = require("../application/commands/complete-demo/complete-demo.command");
const cancel_demo_command_1 = require("../application/commands/cancel-demo/cancel-demo.command");
const get_demo_list_query_1 = require("../application/queries/get-demo-list/get-demo-list.query");
const get_demo_by_id_query_1 = require("../application/queries/get-demo-by-id/get-demo-by-id.query");
const get_demos_by_lead_query_1 = require("../application/queries/get-demos-by-lead/get-demos-by-lead.query");
const get_demo_stats_query_1 = require("../application/queries/get-demo-stats/get-demo-stats.query");
let DemoController = class DemoController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const result = await this.commandBus.execute(new create_demo_command_1.CreateDemoCommand(dto.leadId, userId, dto.mode, new Date(dto.scheduledAt), dto.duration, dto.meetingLink, dto.location, dto.notes));
        return api_response_1.ApiResponse.success(result, 'Demo scheduled');
    }
    async list(query) {
        const result = await this.queryBus.execute(new get_demo_list_query_1.GetDemoListQuery(query.page, query.limit, query.sortBy, query.sortOrder, query.search, query.status, query.mode, query.conductedById, query.fromDate, query.toDate));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async stats(userId, fromDate, toDate) {
        const result = await this.queryBus.execute(new get_demo_stats_query_1.GetDemoStatsQuery(userId, fromDate, toDate));
        return api_response_1.ApiResponse.success(result);
    }
    async byLead(leadId, page = 1, limit = 20) {
        const result = await this.queryBus.execute(new get_demos_by_lead_query_1.GetDemosByLeadQuery(leadId, +page, +limit));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getById(id) {
        const result = await this.queryBus.execute(new get_demo_by_id_query_1.GetDemoByIdQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto, userId) {
        const result = await this.commandBus.execute(new update_demo_command_1.UpdateDemoCommand(id, userId, dto));
        return api_response_1.ApiResponse.success(result, 'Demo updated');
    }
    async reschedule(id, dto, userId) {
        const result = await this.commandBus.execute(new reschedule_demo_command_1.RescheduleDemoCommand(id, userId, new Date(dto.scheduledAt), dto.reason));
        return api_response_1.ApiResponse.success(result, 'Demo rescheduled');
    }
    async complete(id, dto, userId) {
        const result = await this.commandBus.execute(new complete_demo_command_1.CompleteDemoCommand(id, userId, dto.result, dto.outcome, dto.notes));
        return api_response_1.ApiResponse.success(result, 'Demo completed');
    }
    async cancel(id, dto, userId) {
        const result = await this.commandBus.execute(new cancel_demo_command_1.CancelDemoCommand(id, userId, dto.reason, dto.isNoShow));
        return api_response_1.ApiResponse.success(result, 'Demo cancelled');
    }
};
exports.DemoController = DemoController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('demos:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_demo_dto_1.CreateDemoDto, String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('demos:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [demo_query_dto_1.DemoQueryDto]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('demos:read'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('lead/:leadId'),
    (0, require_permissions_decorator_1.RequirePermissions)('demos:read'),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "byLead", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('demos:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('demos:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_demo_dto_1.UpdateDemoDto, String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/reschedule'),
    (0, require_permissions_decorator_1.RequirePermissions)('demos:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reschedule_demo_dto_1.RescheduleDemoDto, String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "reschedule", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, require_permissions_decorator_1.RequirePermissions)('demos:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, complete_demo_dto_1.CompleteDemoDto, String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permissions_decorator_1.RequirePermissions)('demos:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cancel_demo_dto_1.CancelDemoDto, String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "cancel", null);
exports.DemoController = DemoController = __decorate([
    (0, common_1.Controller)('demos'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], DemoController);
//# sourceMappingURL=demo.controller.js.map