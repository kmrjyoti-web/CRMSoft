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
exports.RecurrenceController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_recurrence_dto_1 = require("./dto/create-recurrence.dto");
const update_recurrence_dto_1 = require("./dto/update-recurrence.dto");
const recurrence_query_dto_1 = require("./dto/recurrence-query.dto");
const create_recurrence_command_1 = require("../application/commands/create-recurrence/create-recurrence.command");
const update_recurrence_command_1 = require("../application/commands/update-recurrence/update-recurrence.command");
const cancel_recurrence_command_1 = require("../application/commands/cancel-recurrence/cancel-recurrence.command");
const get_recurrence_list_query_1 = require("../application/queries/get-recurrence-list/get-recurrence-list.query");
const get_recurrence_by_id_query_1 = require("../application/queries/get-recurrence-by-id/get-recurrence-by-id.query");
let RecurrenceController = class RecurrenceController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const result = await this.commandBus.execute(new create_recurrence_command_1.CreateRecurrenceCommand(dto.entityType, dto.pattern, new Date(dto.startDate), userId, dto.templateData, dto.entityId, dto.interval, dto.daysOfWeek, dto.dayOfMonth, dto.endDate ? new Date(dto.endDate) : undefined, dto.maxOccurrences));
        return api_response_1.ApiResponse.success(result, 'Recurring event created');
    }
    async list(query) {
        const result = await this.queryBus.execute(new get_recurrence_list_query_1.GetRecurrenceListQuery(query.page, query.limit, query.createdById, query.pattern, query.isActive));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getById(id) {
        const result = await this.queryBus.execute(new get_recurrence_by_id_query_1.GetRecurrenceByIdQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto, userId) {
        const data = { ...dto, endDate: dto.endDate ? new Date(dto.endDate) : undefined };
        const result = await this.commandBus.execute(new update_recurrence_command_1.UpdateRecurrenceCommand(id, userId, data));
        return api_response_1.ApiResponse.success(result, 'Recurring event updated');
    }
    async cancel(id, userId) {
        const result = await this.commandBus.execute(new cancel_recurrence_command_1.CancelRecurrenceCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Recurring event cancelled');
    }
};
exports.RecurrenceController = RecurrenceController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('recurrence:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_recurrence_dto_1.CreateRecurrenceDto, String]),
    __metadata("design:returntype", Promise)
], RecurrenceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('recurrence:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recurrence_query_dto_1.RecurrenceQueryDto]),
    __metadata("design:returntype", Promise)
], RecurrenceController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('recurrence:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecurrenceController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('recurrence:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_recurrence_dto_1.UpdateRecurrenceDto, String]),
    __metadata("design:returntype", Promise)
], RecurrenceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('recurrence:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecurrenceController.prototype, "cancel", null);
exports.RecurrenceController = RecurrenceController = __decorate([
    (0, common_1.Controller)('recurrence'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], RecurrenceController);
//# sourceMappingURL=recurrence.controller.js.map