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
exports.LookupsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const create_lookup_command_1 = require("../application/commands/create-lookup/create-lookup.command");
const update_lookup_command_1 = require("../application/commands/update-lookup/update-lookup.command");
const deactivate_lookup_command_1 = require("../application/commands/deactivate-lookup/deactivate-lookup.command");
const add_value_command_1 = require("../application/commands/add-value/add-value.command");
const update_value_command_1 = require("../application/commands/update-value/update-value.command");
const reorder_values_command_1 = require("../application/commands/reorder-values/reorder-values.command");
const deactivate_value_command_1 = require("../application/commands/deactivate-value/deactivate-value.command");
const reset_lookup_defaults_command_1 = require("../application/commands/reset-lookup-defaults/reset-lookup-defaults.command");
const get_all_lookups_query_1 = require("../application/queries/get-all-lookups/get-all-lookups.query");
const get_lookup_by_id_query_1 = require("../application/queries/get-lookup-by-id/get-lookup-by-id.query");
const get_values_by_category_query_1 = require("../application/queries/get-values-by-category/get-values-by-category.query");
const create_lookup_dto_1 = require("./dto/create-lookup.dto");
const update_lookup_dto_1 = require("./dto/update-lookup.dto");
const add_value_dto_1 = require("./dto/add-value.dto");
const update_value_dto_1 = require("./dto/update-value.dto");
const reorder_values_dto_1 = require("./dto/reorder-values.dto");
const api_response_1 = require("../../../../../common/utils/api-response");
let LookupsController = class LookupsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async createLookup(dto) {
        const id = await this.commandBus.execute(new create_lookup_command_1.CreateLookupCommand(dto.category, dto.displayName, dto.description, dto.isSystem));
        const lookup = await this.queryBus.execute(new get_lookup_by_id_query_1.GetLookupByIdQuery(id));
        return api_response_1.ApiResponse.success(lookup, 'Lookup created');
    }
    async getAllLookups(activeOnly) {
        const lookups = await this.queryBus.execute(new get_all_lookups_query_1.GetAllLookupsQuery(activeOnly !== 'false'));
        return api_response_1.ApiResponse.success(lookups);
    }
    async getLookupById(id) {
        const lookup = await this.queryBus.execute(new get_lookup_by_id_query_1.GetLookupByIdQuery(id));
        return api_response_1.ApiResponse.success(lookup);
    }
    async updateLookup(id, dto) {
        await this.commandBus.execute(new update_lookup_command_1.UpdateLookupCommand(id, dto));
        const lookup = await this.queryBus.execute(new get_lookup_by_id_query_1.GetLookupByIdQuery(id));
        return api_response_1.ApiResponse.success(lookup, 'Lookup updated');
    }
    async deactivateLookup(id) {
        await this.commandBus.execute(new deactivate_lookup_command_1.DeactivateLookupCommand(id));
        return api_response_1.ApiResponse.success(null, 'Lookup deactivated');
    }
    async getValuesByCategory(category) {
        const result = await this.queryBus.execute(new get_values_by_category_query_1.GetValuesByCategoryQuery(category));
        return api_response_1.ApiResponse.success(result);
    }
    async addValue(lookupId, dto) {
        const id = await this.commandBus.execute(new add_value_command_1.AddValueCommand(lookupId, dto.value, dto.label, dto.icon, dto.color, dto.isDefault, dto.parentId, dto.configJson));
        const lookup = await this.queryBus.execute(new get_lookup_by_id_query_1.GetLookupByIdQuery(lookupId));
        return api_response_1.ApiResponse.success(lookup, 'Value added');
    }
    async updateValue(valueId, dto) {
        await this.commandBus.execute(new update_value_command_1.UpdateValueCommand(valueId, dto));
        return api_response_1.ApiResponse.success(null, 'Value updated');
    }
    async reorderValues(lookupId, dto) {
        await this.commandBus.execute(new reorder_values_command_1.ReorderValuesCommand(lookupId, dto.orderedIds));
        const lookup = await this.queryBus.execute(new get_lookup_by_id_query_1.GetLookupByIdQuery(lookupId));
        return api_response_1.ApiResponse.success(lookup, 'Values reordered');
    }
    async deactivateValue(valueId) {
        await this.commandBus.execute(new deactivate_value_command_1.DeactivateValueCommand(valueId));
        return api_response_1.ApiResponse.success(null, 'Value deactivated');
    }
    async resetToDefaults() {
        const result = await this.commandBus.execute(new reset_lookup_defaults_command_1.ResetLookupDefaultsCommand());
        return api_response_1.ApiResponse.success(result, 'Lookup defaults restored');
    }
};
exports.LookupsController = LookupsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create lookup category (e.g., INDUSTRY, LEAD_SOURCE)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lookup_dto_1.CreateLookupDto]),
    __metadata("design:returntype", Promise)
], LookupsController.prototype, "createLookup", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all lookup categories' }),
    __param(0, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LookupsController.prototype, "getAllLookups", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lookup by ID (with all values)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LookupsController.prototype, "getLookupById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update lookup display name/description' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_lookup_dto_1.UpdateLookupDto]),
    __metadata("design:returntype", Promise)
], LookupsController.prototype, "updateLookup", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate lookup category (non-system only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LookupsController.prototype, "deactivateLookup", null);
__decorate([
    (0, common_1.Get)('values/:category'),
    (0, swagger_1.ApiOperation)({ summary: '⭐ Get values by category name (for dropdowns)' }),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LookupsController.prototype, "getValuesByCategory", null);
__decorate([
    (0, common_1.Post)(':lookupId/values'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a value to a lookup category' }),
    __param(0, (0, common_1.Param)('lookupId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_value_dto_1.AddValueDto]),
    __metadata("design:returntype", Promise)
], LookupsController.prototype, "addValue", null);
__decorate([
    (0, common_1.Put)('values/:valueId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a lookup value (label, icon, color, default)' }),
    __param(0, (0, common_1.Param)('valueId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_value_dto_1.UpdateValueDto]),
    __metadata("design:returntype", Promise)
], LookupsController.prototype, "updateValue", null);
__decorate([
    (0, common_1.Post)(':lookupId/values/reorder'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder values (drag-and-drop)' }),
    __param(0, (0, common_1.Param)('lookupId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reorder_values_dto_1.ReorderValuesDto]),
    __metadata("design:returntype", Promise)
], LookupsController.prototype, "reorderValues", null);
__decorate([
    (0, common_1.Post)('values/:valueId/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a lookup value' }),
    __param(0, (0, common_1.Param)('valueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LookupsController.prototype, "deactivateValue", null);
__decorate([
    (0, common_1.Post)('reset-defaults'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset all system lookups to seed defaults' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LookupsController.prototype, "resetToDefaults", null);
exports.LookupsController = LookupsController = __decorate([
    (0, swagger_1.ApiTags)('Lookups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('lookups'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], LookupsController);
//# sourceMappingURL=lookups.controller.js.map