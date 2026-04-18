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
exports.ModuleAccessController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const super_admin_guard_1 = require("../infrastructure/super-admin.guard");
const super_admin_route_decorator_1 = require("../infrastructure/decorators/super-admin-route.decorator");
const module_definition_service_1 = require("../services/module-definition.service");
const module_access_service_1 = require("../services/module-access.service");
const upsert_module_access_dto_1 = require("./dto/upsert-module-access.dto");
const api_response_1 = require("../../../../../common/utils/api-response");
let ModuleAccessController = class ModuleAccessController {
    constructor(moduleDefinitionService, moduleAccessService) {
        this.moduleDefinitionService = moduleDefinitionService;
        this.moduleAccessService = moduleAccessService;
    }
    async listModules(query) {
        const data = await this.moduleDefinitionService.listAll(query);
        return api_response_1.ApiResponse.success(data);
    }
    async seedModules() {
        const data = await this.moduleDefinitionService.seed();
        return api_response_1.ApiResponse.success(data, 'Module definitions seeded');
    }
    async getByPlan(planId) {
        const data = await this.moduleAccessService.getByPlan(planId);
        return api_response_1.ApiResponse.success(data);
    }
    async upsertAccess(planId, body) {
        const data = await this.moduleAccessService.upsertAccess(planId, body.modules);
        return api_response_1.ApiResponse.success(data, 'Module access updated');
    }
    async getAccessMatrix() {
        const data = await this.moduleAccessService.getAccessMatrix();
        return api_response_1.ApiResponse.success(data);
    }
};
exports.ModuleAccessController = ModuleAccessController;
__decorate([
    (0, common_1.Get)('modules'),
    (0, swagger_1.ApiOperation)({ summary: 'List all module definitions' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ModuleAccessController.prototype, "listModules", null);
__decorate([
    (0, common_1.Post)('modules/seed'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Seed module definitions from default data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModuleAccessController.prototype, "seedModules", null);
__decorate([
    (0, common_1.Get)('plans/:planId/module-access'),
    (0, swagger_1.ApiOperation)({ summary: 'Get module access entries for a plan' }),
    __param(0, (0, common_1.Param)('planId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ModuleAccessController.prototype, "getByPlan", null);
__decorate([
    (0, common_1.Put)('plans/:planId/module-access'),
    (0, swagger_1.ApiOperation)({ summary: 'Upsert module access for a plan' }),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_module_access_dto_1.UpsertModuleAccessDto]),
    __metadata("design:returntype", Promise)
], ModuleAccessController.prototype, "upsertAccess", null);
__decorate([
    (0, common_1.Get)('modules/access-matrix'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full module access matrix across all plans' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModuleAccessController.prototype, "getAccessMatrix", null);
exports.ModuleAccessController = ModuleAccessController = __decorate([
    (0, swagger_1.ApiTags)('Module Access'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, super_admin_route_decorator_1.SuperAdminRoute)(),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Controller)('admin/module-access'),
    __metadata("design:paramtypes", [module_definition_service_1.ModuleDefinitionService,
        module_access_service_1.ModuleAccessService])
], ModuleAccessController);
//# sourceMappingURL=module-access.controller.js.map