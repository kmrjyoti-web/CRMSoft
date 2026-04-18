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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const create_organization_command_1 = require("../application/commands/create-organization/create-organization.command");
const update_organization_command_1 = require("../application/commands/update-organization/update-organization.command");
const deactivate_organization_command_1 = require("../application/commands/deactivate-organization/deactivate-organization.command");
const reactivate_organization_command_1 = require("../application/commands/reactivate-organization/reactivate-organization.command");
const soft_delete_organization_command_1 = require("../application/commands/soft-delete-organization/soft-delete-organization.command");
const restore_organization_command_1 = require("../application/commands/restore-organization/restore-organization.command");
const permanent_delete_organization_command_1 = require("../application/commands/permanent-delete-organization/permanent-delete-organization.command");
const get_organization_by_id_query_1 = require("../application/queries/get-organization-by-id/get-organization-by-id.query");
const get_organizations_list_query_1 = require("../application/queries/get-organizations-list/get-organizations-list.query");
const create_organization_dto_1 = require("./dto/create-organization.dto");
const update_organization_dto_1 = require("./dto/update-organization.dto");
const organization_query_dto_1 = require("./dto/organization-query.dto");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const data_masking_interceptor_1 = require("../../../softwarevendor/table-config/data-masking.interceptor");
let OrganizationsController = class OrganizationsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, user) {
        const userId = user.id;
        const tenantId = user.tenantId ?? '';
        const id = await this.commandBus.execute(new create_organization_command_1.CreateOrganizationCommand(dto.name, userId, tenantId, dto.website, dto.email, dto.phone, dto.gstNumber, dto.address, dto.city, dto.state, dto.country, dto.pincode, dto.industry, dto.annualRevenue, dto.notes, dto.filterIds));
        const org = await this.queryBus.execute(new get_organization_by_id_query_1.GetOrganizationByIdQuery(id));
        return api_response_1.ApiResponse.success(org, 'Organization created');
    }
    async findAll(query) {
        const result = await this.queryBus.execute(new get_organizations_list_query_1.GetOrganizationsListQuery(query.page ?? 1, query.limit ?? 20, query.sortBy ?? 'createdAt', query.sortOrder ?? 'desc', query.search, query.city, query.industry, query.isActive));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async findById(id) {
        const org = await this.queryBus.execute(new get_organization_by_id_query_1.GetOrganizationByIdQuery(id));
        return api_response_1.ApiResponse.success(org);
    }
    async update(id, dto) {
        await this.commandBus.execute(new update_organization_command_1.UpdateOrganizationCommand(id, dto, dto.filterIds));
        const org = await this.queryBus.execute(new get_organization_by_id_query_1.GetOrganizationByIdQuery(id));
        return api_response_1.ApiResponse.success(org, 'Organization updated');
    }
    async deactivate(id) {
        await this.commandBus.execute(new deactivate_organization_command_1.DeactivateOrganizationCommand(id));
        const org = await this.queryBus.execute(new get_organization_by_id_query_1.GetOrganizationByIdQuery(id));
        return api_response_1.ApiResponse.success(org, 'Organization deactivated');
    }
    async reactivate(id) {
        await this.commandBus.execute(new reactivate_organization_command_1.ReactivateOrganizationCommand(id));
        const org = await this.queryBus.execute(new get_organization_by_id_query_1.GetOrganizationByIdQuery(id));
        return api_response_1.ApiResponse.success(org, 'Organization reactivated');
    }
    async softDelete(id, userId) {
        await this.commandBus.execute(new soft_delete_organization_command_1.SoftDeleteOrganizationCommand(id, userId));
        const org = await this.queryBus.execute(new get_organization_by_id_query_1.GetOrganizationByIdQuery(id));
        return api_response_1.ApiResponse.success(org, 'Organization soft-deleted');
    }
    async restore(id) {
        await this.commandBus.execute(new restore_organization_command_1.RestoreOrganizationCommand(id));
        const org = await this.queryBus.execute(new get_organization_by_id_query_1.GetOrganizationByIdQuery(id));
        return api_response_1.ApiResponse.success(org, 'Organization restored');
    }
    async permanentDelete(id) {
        await this.commandBus.execute(new permanent_delete_organization_command_1.PermanentDeleteOrganizationCommand(id));
        return api_response_1.ApiResponse.success({ id, deleted: true }, 'Organization permanently deleted');
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new organization' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_organization_dto_1.CreateOrganizationDto, Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(data_masking_interceptor_1.DataMaskingInterceptor),
    (0, data_masking_interceptor_1.MaskTable)('organizations'),
    (0, swagger_1.ApiOperation)({ summary: 'List organizations (paginated, filtered)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [organization_query_dto_1.OrganizationQueryDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get organization by ID (with contacts, leads, filters)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update organization (active only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_organization_dto_1.UpdateOrganizationDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate organization (soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/reactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reactivate deactivated organization' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Post)(':id/soft-delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete organization (mark as deleted, recoverable)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a soft-deleted organization' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete a soft-deleted organization (irreversible)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "permanentDelete", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, swagger_1.ApiTags)('Organizations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('organizations'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map