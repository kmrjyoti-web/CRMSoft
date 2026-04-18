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
exports.FilterSearchController = exports.EntityFiltersController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const assign_filters_command_1 = require("../application/commands/assign-filters/assign-filters.command");
const remove_filter_command_1 = require("../application/commands/remove-filter/remove-filter.command");
const replace_filters_command_1 = require("../application/commands/replace-filters/replace-filters.command");
const copy_filters_command_1 = require("../application/commands/copy-filters/copy-filters.command");
const get_entity_filters_query_1 = require("../application/queries/get-entity-filters/get-entity-filters.query");
const get_entities_by_filter_query_1 = require("../application/queries/get-entities-by-filter/get-entities-by-filter.query");
const entity_filter_dto_1 = require("./dto/entity-filter.dto");
const entity_filter_types_1 = require("../entity-filter.types");
const api_response_1 = require("../../../../../common/utils/api-response");
let EntityFiltersController = class EntityFiltersController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async getFilters(entityType, entityId) {
        const result = await this.queryBus.execute(new get_entity_filters_query_1.GetEntityFiltersQuery(entityType, entityId));
        return api_response_1.ApiResponse.success(result);
    }
    async assignFilters(entityType, entityId, dto) {
        const result = await this.commandBus.execute(new assign_filters_command_1.AssignFiltersCommand(entityType, entityId, dto.lookupValueIds));
        return api_response_1.ApiResponse.success(result, 'Filters assigned');
    }
    async replaceFilters(entityType, entityId, dto) {
        const result = await this.commandBus.execute(new replace_filters_command_1.ReplaceFiltersCommand(entityType, entityId, dto.lookupValueIds, dto.category));
        return api_response_1.ApiResponse.success(result, 'Filters replaced');
    }
    async removeFilter(entityType, entityId, lookupValueId) {
        await this.commandBus.execute(new remove_filter_command_1.RemoveFilterCommand(entityType, entityId, lookupValueId));
        return api_response_1.ApiResponse.success(null, 'Filter removed');
    }
    async copyFilters(entityType, entityId, dto) {
        const copied = await this.commandBus.execute(new copy_filters_command_1.CopyFiltersCommand(entityType, entityId, dto.targetType, dto.targetId));
        return api_response_1.ApiResponse.success({ copied }, 'Filters copied');
    }
};
exports.EntityFiltersController = EntityFiltersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all filters for an entity (grouped by category)' }),
    (0, swagger_1.ApiParam)({ name: 'entityType', enum: entity_filter_types_1.VALID_ENTITY_TYPES }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EntityFiltersController.prototype, "getFilters", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Assign filters to entity (additive — keeps existing)' }),
    (0, swagger_1.ApiParam)({ name: 'entityType', enum: entity_filter_types_1.VALID_ENTITY_TYPES }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, entity_filter_dto_1.AssignFiltersDto]),
    __metadata("design:returntype", Promise)
], EntityFiltersController.prototype, "assignFilters", null);
__decorate([
    (0, common_1.Post)('replace'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Replace filters (optionally per category)' }),
    (0, swagger_1.ApiParam)({ name: 'entityType', enum: entity_filter_types_1.VALID_ENTITY_TYPES }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, entity_filter_dto_1.ReplaceFiltersDto]),
    __metadata("design:returntype", Promise)
], EntityFiltersController.prototype, "replaceFilters", null);
__decorate([
    (0, common_1.Delete)(':lookupValueId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a single filter from entity' }),
    (0, swagger_1.ApiParam)({ name: 'entityType', enum: entity_filter_types_1.VALID_ENTITY_TYPES }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Param)('lookupValueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EntityFiltersController.prototype, "removeFilter", null);
__decorate([
    (0, common_1.Post)('copy'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Copy all filters to another entity (e.g., RawContact → Contact)' }),
    (0, swagger_1.ApiParam)({ name: 'entityType', enum: entity_filter_types_1.VALID_ENTITY_TYPES }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, entity_filter_dto_1.CopyFiltersDto]),
    __metadata("design:returntype", Promise)
], EntityFiltersController.prototype, "copyFilters", null);
exports.EntityFiltersController = EntityFiltersController = __decorate([
    (0, swagger_1.ApiTags)('Entity Filters'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(':entityType/:entityId/filters'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], EntityFiltersController);
let FilterSearchController = class FilterSearchController {
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    async searchByFilters(entityType, dto) {
        const entityIds = await this.queryBus.execute(new get_entities_by_filter_query_1.GetEntitiesByFilterQuery(entityType, dto.lookupValueIds, dto.matchAll));
        return api_response_1.ApiResponse.success({ entityIds, count: entityIds.length });
    }
};
exports.FilterSearchController = FilterSearchController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Find entity IDs that match filter criteria (AND/OR)' }),
    (0, swagger_1.ApiParam)({ name: 'entityType', enum: entity_filter_types_1.VALID_ENTITY_TYPES }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entity_filter_dto_1.FilterSearchDto]),
    __metadata("design:returntype", Promise)
], FilterSearchController.prototype, "searchByFilters", null);
exports.FilterSearchController = FilterSearchController = __decorate([
    (0, swagger_1.ApiTags)('Entity Filters'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(':entityType/filter-search'),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], FilterSearchController);
//# sourceMappingURL=entity-filters.controller.js.map