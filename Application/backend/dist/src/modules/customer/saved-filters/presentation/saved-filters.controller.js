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
exports.SavedFiltersController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_saved_filter_dto_1 = require("./dto/create-saved-filter.dto");
const update_saved_filter_dto_1 = require("./dto/update-saved-filter.dto");
const saved_filter_query_dto_1 = require("./dto/saved-filter-query.dto");
const create_saved_filter_command_1 = require("../application/commands/create-saved-filter/create-saved-filter.command");
const update_saved_filter_command_1 = require("../application/commands/update-saved-filter/update-saved-filter.command");
const delete_saved_filter_command_1 = require("../application/commands/delete-saved-filter/delete-saved-filter.command");
const list_saved_filters_query_1 = require("../application/queries/list-saved-filters/list-saved-filters.query");
const get_saved_filter_query_1 = require("../application/queries/get-saved-filter/get-saved-filter.query");
let SavedFiltersController = class SavedFiltersController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async list(query, userId) {
        const result = await this.queryBus.execute(new list_saved_filters_query_1.ListSavedFiltersQuery(userId, query.entityType, query.search, query.page, query.limit));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async getById(id) {
        const result = await this.queryBus.execute(new get_saved_filter_query_1.GetSavedFilterQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async create(dto, userId) {
        const result = await this.commandBus.execute(new create_saved_filter_command_1.CreateSavedFilterCommand(dto.name, dto.entityType, dto.filterConfig, userId, dto.description, dto.isDefault, dto.isShared, dto.sharedWithRoles));
        return api_response_1.ApiResponse.success(result, 'Filter saved');
    }
    async update(id, dto, userId) {
        const result = await this.commandBus.execute(new update_saved_filter_command_1.UpdateSavedFilterCommand(id, userId, dto));
        return api_response_1.ApiResponse.success(result, 'Filter updated');
    }
    async remove(id, userId) {
        const result = await this.commandBus.execute(new delete_saved_filter_command_1.DeleteSavedFilterCommand(id, userId));
        return api_response_1.ApiResponse.success(result, 'Filter deleted');
    }
};
exports.SavedFiltersController = SavedFiltersController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('saved-filters:read'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [saved_filter_query_dto_1.SavedFilterQueryDto, String]),
    __metadata("design:returntype", Promise)
], SavedFiltersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('saved-filters:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SavedFiltersController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('saved-filters:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_saved_filter_dto_1.CreateSavedFilterDto, String]),
    __metadata("design:returntype", Promise)
], SavedFiltersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('saved-filters:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_saved_filter_dto_1.UpdateSavedFilterDto, String]),
    __metadata("design:returntype", Promise)
], SavedFiltersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('saved-filters:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SavedFiltersController.prototype, "remove", null);
exports.SavedFiltersController = SavedFiltersController = __decorate([
    (0, common_1.Controller)('saved-filters'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], SavedFiltersController);
//# sourceMappingURL=saved-filters.controller.js.map