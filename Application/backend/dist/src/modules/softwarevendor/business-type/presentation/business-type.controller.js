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
exports.BusinessTypeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../../../common/decorators/roles.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const business_type_service_1 = require("../services/business-type.service");
const terminology_service_1 = require("../services/terminology.service");
const industry_config_service_1 = require("../services/industry-config.service");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const business_type_dto_1 = require("./dto/business-type.dto");
let BusinessTypeController = class BusinessTypeController {
    constructor(btService, termService, configService, prisma) {
        this.btService = btService;
        this.termService = termService;
        this.configService = configService;
        this.prisma = prisma;
    }
    async publicList() {
        const data = await this.btService.listAll(true);
        return api_response_1.ApiResponse.success(data);
    }
    async publicPackages(code) {
        const bt = await this.btService.getByCode(code);
        const packages = await this.prisma.platform.industryPackage.findMany({
            where: { industryId: bt.id },
            include: { package: true },
            orderBy: { sortOrder: 'asc' },
        });
        return api_response_1.ApiResponse.success(packages);
    }
    async listAll(activeOnly) {
        const data = await this.btService.listAll(activeOnly !== 'false');
        return api_response_1.ApiResponse.success(data);
    }
    async getProfile(tenantId) {
        const profile = await this.btService.resolveProfile(tenantId);
        return api_response_1.ApiResponse.success(profile);
    }
    async getConfig(tenantId) {
        const config = await this.configService.getConfig(tenantId);
        return api_response_1.ApiResponse.success(config);
    }
    async getExtraFields(tenantId, entity) {
        const fields = await this.configService.getExtraFields(tenantId, entity);
        return api_response_1.ApiResponse.success(fields);
    }
    async getLeadStages(tenantId) {
        const stages = await this.configService.getLeadStages(tenantId);
        return api_response_1.ApiResponse.success(stages);
    }
    async getActivityTypes(tenantId) {
        const types = await this.configService.getActivityTypes(tenantId);
        return api_response_1.ApiResponse.success(types);
    }
    async getTenants(code) {
        const tenants = await this.btService.getTenants(code);
        return api_response_1.ApiResponse.success(tenants);
    }
    async getByCode(code) {
        const bt = await this.btService.getByCode(code);
        return api_response_1.ApiResponse.success(bt);
    }
    async updateByCode(code, dto) {
        const result = await this.btService.update(code, dto);
        return api_response_1.ApiResponse.success(result);
    }
    async activate(code) {
        const result = await this.btService.update(code, { isActive: true });
        return api_response_1.ApiResponse.success(result);
    }
    async deactivate(code) {
        const result = await this.btService.update(code, { isActive: false });
        return api_response_1.ApiResponse.success(result);
    }
    async seed() {
        const result = await this.btService.seed();
        return api_response_1.ApiResponse.success({ seeded: result.length });
    }
    async assign(tenantId, dto) {
        const result = await this.btService.assignToTenant(tenantId, dto.typeCode);
        return api_response_1.ApiResponse.success(result);
    }
    async updateTradeProfile(tenantId, dto) {
        const result = await this.btService.updateTradeProfile(tenantId, dto.profile);
        return api_response_1.ApiResponse.success(result);
    }
    async getTerminology(tenantId) {
        const map = await this.termService.getResolved(tenantId);
        return api_response_1.ApiResponse.success(map);
    }
    async listOverrides(tenantId) {
        const data = await this.termService.list(tenantId);
        return api_response_1.ApiResponse.success(data);
    }
    async upsertOverride(tenantId, dto) {
        const result = await this.termService.upsert(tenantId, dto);
        return api_response_1.ApiResponse.success(result);
    }
    async bulkUpsert(tenantId, dto) {
        const result = await this.termService.bulkUpsert(tenantId, dto.items);
        return api_response_1.ApiResponse.success(result);
    }
    async removeOverride(tenantId, termKey, scope) {
        await this.termService.remove(tenantId, termKey, scope);
        return api_response_1.ApiResponse.success(null, 'Override removed');
    }
};
exports.BusinessTypeController = BusinessTypeController;
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)('public/list'),
    (0, swagger_1.ApiOperation)({ summary: 'List active industries (public, for registration)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "publicList", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)('public/:code/packages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get packages for an industry (public)' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "publicPackages", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all business types' }),
    __param(0, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "listAll", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get resolved profile for current tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get industry config for current tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)('extra-fields/:entity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get extra fields for entity in current industry' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "getExtraFields", null);
__decorate([
    (0, common_1.Get)('lead-stages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get industry-specific lead stages' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "getLeadStages", null);
__decorate([
    (0, common_1.Get)('activity-types'),
    (0, swagger_1.ApiOperation)({ summary: 'Get industry-specific activity types' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "getActivityTypes", null);
__decorate([
    (0, common_1.Get)(':code/tenants'),
    (0, swagger_1.ApiOperation)({ summary: 'List tenants using this industry' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "getTenants", null);
__decorate([
    (0, common_1.Get)(':code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get business type by code' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "getByCode", null);
__decorate([
    (0, common_1.Put)(':code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update business type by code (vendor)' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, business_type_dto_1.UpdateBusinessTypeDto]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "updateByCode", null);
__decorate([
    (0, common_1.Post)(':code/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate an industry' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':code/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate an industry' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)('seed'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Seed default business types' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "seed", null);
__decorate([
    (0, common_1.Put)('assign'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Assign business type to tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, business_type_dto_1.AssignBusinessTypeDto]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "assign", null);
__decorate([
    (0, common_1.Put)('trade-profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant trade profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, business_type_dto_1.UpdateTradeProfileDto]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "updateTradeProfile", null);
__decorate([
    (0, common_1.Get)('terminology/resolved'),
    (0, swagger_1.ApiOperation)({ summary: 'Get resolved terminology map for tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "getTerminology", null);
__decorate([
    (0, common_1.Get)('terminology/overrides'),
    (0, swagger_1.ApiOperation)({ summary: 'List raw terminology overrides for tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "listOverrides", null);
__decorate([
    (0, common_1.Put)('terminology/overrides'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Upsert a single terminology override' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, business_type_dto_1.TerminologyItemDto]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "upsertOverride", null);
__decorate([
    (0, common_1.Put)('terminology/overrides/bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk upsert terminology overrides' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, business_type_dto_1.BulkTerminologyDto]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "bulkUpsert", null);
__decorate([
    (0, common_1.Delete)('terminology/overrides/:termKey'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a terminology override' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('termKey')),
    __param(2, (0, common_1.Query)('scope')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "removeOverride", null);
exports.BusinessTypeController = BusinessTypeController = __decorate([
    (0, swagger_1.ApiTags)('Business Types'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('business-types'),
    __metadata("design:paramtypes", [business_type_service_1.BusinessTypeService,
        terminology_service_1.TerminologyService,
        industry_config_service_1.IndustryConfigService,
        prisma_service_1.PrismaService])
], BusinessTypeController);
//# sourceMappingURL=business-type.controller.js.map