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
exports.CustomFieldsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const api_response_1 = require("../../../../../common/utils/api-response");
const require_permissions_decorator_1 = require("../../../../../core/permissions/decorators/require-permissions.decorator");
const create_field_definition_dto_1 = require("./dto/create-field-definition.dto");
const update_field_definition_dto_1 = require("./dto/update-field-definition.dto");
const set_field_value_dto_1 = require("./dto/set-field-value.dto");
const create_field_definition_command_1 = require("../application/commands/create-field-definition/create-field-definition.command");
const update_field_definition_command_1 = require("../application/commands/update-field-definition/update-field-definition.command");
const delete_field_definition_command_1 = require("../application/commands/delete-field-definition/delete-field-definition.command");
const set_field_value_command_1 = require("../application/commands/set-field-value/set-field-value.command");
const get_field_definitions_query_1 = require("../application/queries/get-field-definitions/get-field-definitions.query");
const get_entity_values_query_1 = require("../application/queries/get-entity-values/get-entity-values.query");
const get_form_schema_query_1 = require("../application/queries/get-form-schema/get-form-schema.query");
let CustomFieldsController = class CustomFieldsController {
    constructor(commandBus, queryBus, prisma) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.prisma = prisma;
    }
    async createDefinition(dto) {
        const result = await this.commandBus.execute(new create_field_definition_command_1.CreateFieldDefinitionCommand(dto.entityType, dto.fieldName, dto.fieldLabel, dto.fieldType, dto.isRequired, dto.defaultValue, dto.options, dto.sortOrder));
        return api_response_1.ApiResponse.success(result, 'Field definition created');
    }
    async getDefinitions(entityType, includeInactive) {
        const result = await this.queryBus.execute(new get_field_definitions_query_1.GetFieldDefinitionsQuery(entityType, includeInactive !== 'true'));
        return api_response_1.ApiResponse.success(result);
    }
    async updateDefinition(id, dto) {
        const result = await this.commandBus.execute(new update_field_definition_command_1.UpdateFieldDefinitionCommand(id, dto));
        return api_response_1.ApiResponse.success(result, 'Field definition updated');
    }
    async deleteDefinition(id) {
        const result = await this.commandBus.execute(new delete_field_definition_command_1.DeleteFieldDefinitionCommand(id));
        return api_response_1.ApiResponse.success(result, 'Field definition deactivated');
    }
    async setValues(entityType, entityId, dto) {
        const result = await this.commandBus.execute(new set_field_value_command_1.SetFieldValueCommand(entityType, entityId, dto.values));
        return api_response_1.ApiResponse.success(result, 'Values saved');
    }
    async getValues(entityType, entityId) {
        const result = await this.queryBus.execute(new get_entity_values_query_1.GetEntityValuesQuery(entityType, entityId));
        return api_response_1.ApiResponse.success(result);
    }
    async getFormSchema(entityType) {
        const result = await this.queryBus.execute(new get_form_schema_query_1.GetFormSchemaQuery(entityType));
        return api_response_1.ApiResponse.success(result);
    }
    async filterByField(entityType, fieldName, operator = 'eq', value, page = '1', limit = '20') {
        const p = Math.max(1, +page);
        const l = Math.min(100, Math.max(1, +limit));
        const where = this.buildFilterWhere(entityType.toUpperCase(), fieldName, operator, value);
        const [data, total] = await Promise.all([
            this.prisma.entityConfigValue.findMany({
                where, skip: (p - 1) * l, take: l,
                include: { definition: { select: { fieldName: true, fieldLabel: true } } },
            }),
            this.prisma.entityConfigValue.count({ where }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    buildFilterWhere(entityType, fieldName, operator, value) {
        const base = {
            entityType,
            definition: { fieldName, isActive: true },
        };
        switch (operator) {
            case 'eq':
                base.valueText = value;
                break;
            case 'contains':
                base.valueText = { contains: value, mode: 'insensitive' };
                break;
            case 'gt':
                base.valueNumber = { gt: parseFloat(value) };
                break;
            case 'lt':
                base.valueNumber = { lt: parseFloat(value) };
                break;
            case 'gte':
                base.valueNumber = { gte: parseFloat(value) };
                break;
            case 'lte':
                base.valueNumber = { lte: parseFloat(value) };
                break;
            case 'between': {
                const [min, max] = value.split(',').map(Number);
                base.valueNumber = { gte: min, lte: max };
                break;
            }
            case 'dropdown':
                base.valueDropdown = value;
                break;
            default: base.valueText = value;
        }
        return base;
    }
};
exports.CustomFieldsController = CustomFieldsController;
__decorate([
    (0, common_1.Post)('definitions'),
    (0, swagger_1.ApiOperation)({ summary: 'Create custom field definition' }),
    (0, require_permissions_decorator_1.RequirePermissions)('custom_fields:create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_field_definition_dto_1.CreateFieldDefinitionDto]),
    __metadata("design:returntype", Promise)
], CustomFieldsController.prototype, "createDefinition", null);
__decorate([
    (0, common_1.Get)('definitions'),
    (0, swagger_1.ApiOperation)({ summary: 'List field definitions for entity type' }),
    (0, require_permissions_decorator_1.RequirePermissions)('custom_fields:read'),
    __param(0, (0, common_1.Query)('entityType')),
    __param(1, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomFieldsController.prototype, "getDefinitions", null);
__decorate([
    (0, common_1.Put)('definitions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update field definition' }),
    (0, require_permissions_decorator_1.RequirePermissions)('custom_fields:update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_field_definition_dto_1.UpdateFieldDefinitionDto]),
    __metadata("design:returntype", Promise)
], CustomFieldsController.prototype, "updateDefinition", null);
__decorate([
    (0, common_1.Delete)('definitions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate field definition' }),
    (0, require_permissions_decorator_1.RequirePermissions)('custom_fields:delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomFieldsController.prototype, "deleteDefinition", null);
__decorate([
    (0, common_1.Post)(':entityType/:entityId/values'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set custom field values for entity' }),
    (0, require_permissions_decorator_1.RequirePermissions)('custom_fields:update'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, set_field_value_dto_1.BulkSetFieldValuesDto]),
    __metadata("design:returntype", Promise)
], CustomFieldsController.prototype, "setValues", null);
__decorate([
    (0, common_1.Get)(':entityType/:entityId/values'),
    (0, swagger_1.ApiOperation)({ summary: 'Get custom field values for entity' }),
    (0, require_permissions_decorator_1.RequirePermissions)('custom_fields:read'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomFieldsController.prototype, "getValues", null);
__decorate([
    (0, common_1.Get)(':entityType/form-schema'),
    (0, swagger_1.ApiOperation)({ summary: 'Get form schema for entity type' }),
    (0, require_permissions_decorator_1.RequirePermissions)('custom_fields:read'),
    __param(0, (0, common_1.Param)('entityType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomFieldsController.prototype, "getFormSchema", null);
__decorate([
    (0, common_1.Get)(':entityType/filter'),
    (0, swagger_1.ApiOperation)({ summary: 'Filter entities by custom field value' }),
    (0, require_permissions_decorator_1.RequirePermissions)('custom_fields:read'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Query)('fieldName')),
    __param(2, (0, common_1.Query)('operator')),
    __param(3, (0, common_1.Query)('value')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomFieldsController.prototype, "filterByField", null);
exports.CustomFieldsController = CustomFieldsController = __decorate([
    (0, swagger_1.ApiTags)('Custom Fields'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('custom-fields'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        prisma_service_1.PrismaService])
], CustomFieldsController);
//# sourceMappingURL=custom-fields.controller.js.map