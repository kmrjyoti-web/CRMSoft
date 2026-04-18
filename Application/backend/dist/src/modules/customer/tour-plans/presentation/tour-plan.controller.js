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
exports.TourPlanController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_tour_plan_dto_1 = require("./dto/create-tour-plan.dto");
const update_tour_plan_dto_1 = require("./dto/update-tour-plan.dto");
const approve_reject_dto_1 = require("./dto/approve-reject.dto");
const check_in_out_dto_1 = require("./dto/check-in-out.dto");
const tour_plan_query_dto_1 = require("./dto/tour-plan-query.dto");
const create_tour_plan_command_1 = require("../application/commands/create-tour-plan/create-tour-plan.command");
const update_tour_plan_command_1 = require("../application/commands/update-tour-plan/update-tour-plan.command");
const submit_tour_plan_command_1 = require("../application/commands/submit-tour-plan/submit-tour-plan.command");
const approve_tour_plan_command_1 = require("../application/commands/approve-tour-plan/approve-tour-plan.command");
const reject_tour_plan_command_1 = require("../application/commands/reject-tour-plan/reject-tour-plan.command");
const check_in_visit_command_1 = require("../application/commands/check-in-visit/check-in-visit.command");
const check_out_visit_command_1 = require("../application/commands/check-out-visit/check-out-visit.command");
const cancel_tour_plan_command_1 = require("../application/commands/cancel-tour-plan/cancel-tour-plan.command");
const get_tour_plan_list_query_1 = require("../application/queries/get-tour-plan-list/get-tour-plan-list.query");
const get_tour_plan_by_id_query_1 = require("../application/queries/get-tour-plan-by-id/get-tour-plan-by-id.query");
const get_tour_plan_stats_query_1 = require("../application/queries/get-tour-plan-stats/get-tour-plan-stats.query");
let TourPlanController = class TourPlanController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const visits = dto.visits?.map((v) => ({ ...v, scheduledTime: v.scheduledTime ? new Date(v.scheduledTime) : undefined }));
        const result = await this.commandBus.execute(new create_tour_plan_command_1.CreateTourPlanCommand(dto.title, new Date(dto.planDate), userId, dto.leadId, dto.description, dto.startLocation, dto.endLocation, visits));
        return api_response_1.ApiResponse.success(result, 'Tour plan created');
    }
    async list(query) {
        const result = await this.queryBus.execute(new get_tour_plan_list_query_1.GetTourPlanListQuery(query.page, query.limit, query.sortBy, query.sortOrder, query.search, query.status, query.salesPersonId, query.fromDate, query.toDate));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async stats(userId, fromDate, toDate) {
        const result = await this.queryBus.execute(new get_tour_plan_stats_query_1.GetTourPlanStatsQuery(userId, fromDate, toDate));
        return api_response_1.ApiResponse.success(result);
    }
    async byUser(userId, query) {
        const result = await this.queryBus.execute(new get_tour_plan_list_query_1.GetTourPlanListQuery(query.page, query.limit, query.sortBy, query.sortOrder, query.search, query.status, userId, query.fromDate, query.toDate));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getById(id) {
        const result = await this.queryBus.execute(new get_tour_plan_by_id_query_1.GetTourPlanByIdQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto, userId) {
        const data = { ...dto, planDate: dto.planDate ? new Date(dto.planDate) : undefined };
        const result = await this.commandBus.execute(new update_tour_plan_command_1.UpdateTourPlanCommand(id, userId, data));
        return api_response_1.ApiResponse.success(result, 'Tour plan updated');
    }
    async submit(id, userId) {
        const result = await this.commandBus.execute(new submit_tour_plan_command_1.SubmitTourPlanCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Tour plan submitted for approval');
    }
    async approve(id, dto, userId) {
        const result = await this.commandBus.execute(new approve_tour_plan_command_1.ApproveTourPlanCommand(id, userId, dto.comment));
        return api_response_1.ApiResponse.success(result, 'Tour plan approved');
    }
    async reject(id, dto, userId) {
        const result = await this.commandBus.execute(new reject_tour_plan_command_1.RejectTourPlanCommand(id, userId, dto.reason));
        return api_response_1.ApiResponse.success(result, 'Tour plan rejected');
    }
    async cancel(id, userId) {
        const result = await this.commandBus.execute(new cancel_tour_plan_command_1.CancelTourPlanCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Tour plan cancelled');
    }
    async checkIn(visitId, dto, userId) {
        const result = await this.commandBus.execute(new check_in_visit_command_1.CheckInVisitCommand(visitId, userId, dto.latitude, dto.longitude, dto.photoUrl));
        return api_response_1.ApiResponse.success(result, 'Checked in');
    }
    async checkOut(visitId, dto, userId) {
        const result = await this.commandBus.execute(new check_out_visit_command_1.CheckOutVisitCommand(visitId, userId, dto.latitude, dto.longitude, dto.photoUrl, dto.outcome, dto.notes));
        return api_response_1.ApiResponse.success(result, 'Checked out');
    }
};
exports.TourPlanController = TourPlanController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('tour-plans:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tour_plan_dto_1.CreateTourPlanDto, String]),
    __metadata("design:returntype", Promise)
], TourPlanController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('tour-plans:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tour_plan_query_dto_1.TourPlanQueryDto]),
    __metadata("design:returntype", Promise)
], TourPlanController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('tour-plans:read'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TourPlanController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, require_permissions_decorator_1.RequirePermissions)('tour-plans:read'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tour_plan_query_dto_1.TourPlanQueryDto]),
    __metadata("design:returntype", Promise)
], TourPlanController.prototype, "byUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('tour-plans:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TourPlanController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('tour-plans:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tour_plan_dto_1.UpdateTourPlanDto, String]),
    __metadata("design:returntype", Promise)
], TourPlanController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, require_permissions_decorator_1.RequirePermissions)('tour-plans:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TourPlanController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, require_permissions_decorator_1.RequirePermissions)('tour-plans:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_reject_dto_1.ApproveTourPlanDto, String]),
    __metadata("design:returntype", Promise)
], TourPlanController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, require_permissions_decorator_1.RequirePermissions)('tour-plans:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_reject_dto_1.RejectTourPlanDto, String]),
    __metadata("design:returntype", Promise)
], TourPlanController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, require_permissions_decorator_1.RequirePermissions)('tour-plans:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TourPlanController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)('visits/:visitId/check-in'),
    (0, require_permissions_decorator_1.RequirePermissions)('tour-plans:update'),
    __param(0, (0, common_1.Param)('visitId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, check_in_out_dto_1.CheckInDto, String]),
    __metadata("design:returntype", Promise)
], TourPlanController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('visits/:visitId/check-out'),
    (0, require_permissions_decorator_1.RequirePermissions)('tour-plans:update'),
    __param(0, (0, common_1.Param)('visitId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, check_in_out_dto_1.CheckOutDto, String]),
    __metadata("design:returntype", Promise)
], TourPlanController.prototype, "checkOut", null);
exports.TourPlanController = TourPlanController = __decorate([
    (0, common_1.Controller)('tour-plans'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], TourPlanController);
//# sourceMappingURL=tour-plan.controller.js.map