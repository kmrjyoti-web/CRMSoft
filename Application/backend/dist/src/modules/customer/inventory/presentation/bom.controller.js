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
exports.BOMController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_1 = require("../../../../common/utils/api-response");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const bom_formula_service_1 = require("../services/bom-formula.service");
const bom_calculation_service_1 = require("../services/bom-calculation.service");
const bom_production_service_1 = require("../services/bom-production.service");
const scrap_service_1 = require("../services/scrap.service");
const bom_report_service_1 = require("../services/bom-report.service");
const bom_dto_1 = require("./dto/bom.dto");
let BOMController = class BOMController {
    constructor(formulaService, calculationService, productionService, scrapService, reportService) {
        this.formulaService = formulaService;
        this.calculationService = calculationService;
        this.productionService = productionService;
        this.scrapService = scrapService;
        this.reportService = reportService;
    }
    async createRecipe(tenantId, dto) {
        const data = await this.formulaService.create(tenantId, dto);
        return api_response_1.ApiResponse.success(data, 'Recipe created');
    }
    async listRecipes(tenantId, productId, industryCode, isActive, search) {
        const data = await this.formulaService.findAll(tenantId, {
            productId, industryCode, search,
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
        });
        return api_response_1.ApiResponse.success(data);
    }
    async getRecipe(tenantId, id) {
        const data = await this.formulaService.findById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async updateRecipe(tenantId, id, dto) {
        const data = await this.formulaService.update(tenantId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Recipe updated');
    }
    async duplicateRecipe(tenantId, id, newName) {
        const data = await this.formulaService.duplicate(tenantId, id, newName);
        return api_response_1.ApiResponse.success(data, 'Recipe duplicated');
    }
    async deactivateRecipe(tenantId, id) {
        const data = await this.formulaService.deactivate(tenantId, id);
        return api_response_1.ApiResponse.success(data, 'Recipe deactivated');
    }
    async checkStock(tenantId, id, dto) {
        const data = await this.calculationService.checkStock(tenantId, id, dto.quantity, dto.locationId);
        return api_response_1.ApiResponse.success(data);
    }
    async startProduction(tenantId, userId, dto) {
        const data = await this.productionService.startProduction(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Production started');
    }
    async listProduction(tenantId, status, formulaId, startDate, endDate) {
        const data = await this.productionService.findAll(tenantId, { status, formulaId, startDate, endDate });
        return api_response_1.ApiResponse.success(data);
    }
    async getProduction(tenantId, id) {
        const data = await this.productionService.findById(tenantId, id);
        return api_response_1.ApiResponse.success(data);
    }
    async completeProduction(tenantId, userId, id, dto) {
        const data = await this.productionService.completeProduction(tenantId, userId, id, dto);
        return api_response_1.ApiResponse.success(data, 'Production completed');
    }
    async cancelProduction(tenantId, id, dto) {
        const data = await this.productionService.cancel(tenantId, id, dto.reason);
        return api_response_1.ApiResponse.success(data, 'Production cancelled');
    }
    async listScrap(tenantId, scrapType, productId, locationId, startDate, endDate) {
        const data = await this.scrapService.findAll(tenantId, { scrapType, productId, locationId, startDate, endDate });
        return api_response_1.ApiResponse.success(data);
    }
    async recordScrap(tenantId, userId, dto) {
        const data = await this.scrapService.recordScrap(tenantId, userId, dto);
        return api_response_1.ApiResponse.success(data, 'Scrap recorded');
    }
    async writeOffScrap(tenantId, id, dto) {
        const data = await this.scrapService.writeOff(tenantId, id, dto.disposalMethod);
        return api_response_1.ApiResponse.success(data, 'Scrap written off');
    }
    async productionReport(tenantId, startDate, endDate, formulaId, status) {
        const data = await this.reportService.productionReport(tenantId, { startDate, endDate, formulaId, status });
        return api_response_1.ApiResponse.success(data);
    }
    async consumptionReport(tenantId, startDate, endDate, productId) {
        const data = await this.reportService.consumptionReport(tenantId, { startDate, endDate, productId });
        return api_response_1.ApiResponse.success(data);
    }
    async costingReport(tenantId, formulaId) {
        const data = await this.reportService.costingReport(tenantId, formulaId);
        return api_response_1.ApiResponse.success(data);
    }
    async yieldReport(tenantId, startDate, endDate) {
        const data = await this.reportService.yieldReport(tenantId, { startDate, endDate });
        return api_response_1.ApiResponse.success(data);
    }
};
exports.BOMController = BOMController;
__decorate([
    (0, common_1.Post)('recipes'),
    (0, swagger_1.ApiOperation)({ summary: 'Create recipe / BOM formula' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, bom_dto_1.CreateBOMFormulaDto]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "createRecipe", null);
__decorate([
    (0, common_1.Get)('recipes'),
    (0, swagger_1.ApiOperation)({ summary: 'List recipes' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('industryCode')),
    __param(3, (0, common_1.Query)('isActive')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "listRecipes", null);
__decorate([
    (0, common_1.Get)('recipes/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recipe detail with stock levels' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "getRecipe", null);
__decorate([
    (0, common_1.Patch)('recipes/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update recipe (creates new version if items changed)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, bom_dto_1.UpdateBOMFormulaDto]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "updateRecipe", null);
__decorate([
    (0, common_1.Post)('recipes/:id/duplicate'),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicate recipe' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)('newName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "duplicateRecipe", null);
__decorate([
    (0, common_1.Post)('recipes/:id/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate recipe' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "deactivateRecipe", null);
__decorate([
    (0, common_1.Post)('recipes/:id/check-stock'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check stock availability for production' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, bom_dto_1.CheckStockDto]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "checkStock", null);
__decorate([
    (0, common_1.Post)('production'),
    (0, swagger_1.ApiOperation)({ summary: 'Start production run' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, bom_dto_1.StartProductionDto]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "startProduction", null);
__decorate([
    (0, common_1.Get)('production'),
    (0, swagger_1.ApiOperation)({ summary: 'List production runs' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('formulaId')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "listProduction", null);
__decorate([
    (0, common_1.Get)('production/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get production detail with transactions + scrap' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "getProduction", null);
__decorate([
    (0, common_1.Post)('production/:id/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Complete production (deduct raw materials, add finished product)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, bom_dto_1.CompleteProductionDto]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "completeProduction", null);
__decorate([
    (0, common_1.Post)('production/:id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel production run' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, bom_dto_1.CancelProductionDto]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "cancelProduction", null);
__decorate([
    (0, common_1.Get)('scrap'),
    (0, swagger_1.ApiOperation)({ summary: 'List scrap records' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('scrapType')),
    __param(2, (0, common_1.Query)('productId')),
    __param(3, (0, common_1.Query)('locationId')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "listScrap", null);
__decorate([
    (0, common_1.Post)('scrap'),
    (0, swagger_1.ApiOperation)({ summary: 'Record scrap manually' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, bom_dto_1.RecordScrapDto]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "recordScrap", null);
__decorate([
    (0, common_1.Post)('scrap/:id/write-off'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Write off scrap' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:update'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, bom_dto_1.WriteOffScrapDto]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "writeOffScrap", null);
__decorate([
    (0, common_1.Get)('reports/production'),
    (0, swagger_1.ApiOperation)({ summary: 'Production report' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('formulaId')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "productionReport", null);
__decorate([
    (0, common_1.Get)('reports/consumption'),
    (0, swagger_1.ApiOperation)({ summary: 'Raw material consumption report' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "consumptionReport", null);
__decorate([
    (0, common_1.Get)('reports/bom-costing'),
    (0, swagger_1.ApiOperation)({ summary: 'BOM cost breakdown' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('formulaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "costingReport", null);
__decorate([
    (0, common_1.Get)('reports/yield'),
    (0, swagger_1.ApiOperation)({ summary: 'Yield analysis (actual vs expected)' }),
    (0, require_permissions_decorator_1.RequirePermissions)('inventory:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BOMController.prototype, "yieldReport", null);
exports.BOMController = BOMController = __decorate([
    (0, swagger_1.ApiTags)('BOM / Recipes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [bom_formula_service_1.BOMFormulaService,
        bom_calculation_service_1.BOMCalculationService,
        bom_production_service_1.BOMProductionService,
        scrap_service_1.ScrapService,
        bom_report_service_1.BOMReportService])
], BOMController);
//# sourceMappingURL=bom.controller.js.map