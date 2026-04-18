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
exports.ModuleRegistryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const api_response_1 = require("../../../../../common/utils/api-response");
const module_registry_service_1 = require("../services/module-registry.service");
let ModuleRegistryController = class ModuleRegistryController {
    constructor(moduleRegistryService) {
        this.moduleRegistryService = moduleRegistryService;
    }
    async list(category, status, search, page, limit) {
        const { data, total } = await this.moduleRegistryService.list({
            category,
            status,
            search,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
        const p = Math.max(Number(page) || 1, 1);
        const l = Math.min(Math.max(Number(limit) || 20, 1), 100);
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async getById(id) {
        const module = await this.moduleRegistryService.getById(id);
        return api_response_1.ApiResponse.success(module);
    }
    async create(body) {
        const module = await this.moduleRegistryService.create(body);
        return api_response_1.ApiResponse.success(module, 'Module definition created');
    }
    async update(id, body) {
        const module = await this.moduleRegistryService.update(id, body);
        return api_response_1.ApiResponse.success(module, 'Module definition updated');
    }
    async archive(id) {
        const module = await this.moduleRegistryService.archive(id);
        return api_response_1.ApiResponse.success(module, 'Module definition archived');
    }
    async addFeature(id, body) {
        const module = await this.moduleRegistryService.addFeature(id, body);
        return api_response_1.ApiResponse.success(module, 'Feature added');
    }
    async updateFeature(id, code, body) {
        const module = await this.moduleRegistryService.updateFeature(id, code, body);
        return api_response_1.ApiResponse.success(module, 'Feature updated');
    }
    async removeFeature(id, code) {
        const module = await this.moduleRegistryService.removeFeature(id, code);
        return api_response_1.ApiResponse.success(module, 'Feature removed');
    }
    async setMenuKeys(id, body) {
        const module = await this.moduleRegistryService.setMenuKeys(id, body.menuKeys);
        return api_response_1.ApiResponse.success(module, 'Menu keys updated');
    }
    async getDependencyTree(id) {
        const tree = await this.moduleRegistryService.getDependencyTree(id);
        return api_response_1.ApiResponse.success(tree);
    }
    async setDependencies(id, body) {
        const module = await this.moduleRegistryService.setDependencies(id, body.dependsOn);
        return api_response_1.ApiResponse.success(module, 'Dependencies updated');
    }
    async getSubscribers(id, page, limit) {
        const p = Math.max(Number(page) || 1, 1);
        const l = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const { data, total } = await this.moduleRegistryService.getSubscribers(id, {
            page: p,
            limit: l,
        });
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
};
exports.ModuleRegistryController = ModuleRegistryController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List module definitions with filtering and pagination' }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ModuleRegistryController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a module definition by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ModuleRegistryController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new module definition' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ModuleRegistryController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a module definition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ModuleRegistryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive a module definition (soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ModuleRegistryController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/features'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a feature to a module definition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ModuleRegistryController.prototype, "addFeature", null);
__decorate([
    (0, common_1.Patch)(':id/features/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a feature within a module definition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('code')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ModuleRegistryController.prototype, "updateFeature", null);
__decorate([
    (0, common_1.Delete)(':id/features/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a feature from a module definition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ModuleRegistryController.prototype, "removeFeature", null);
__decorate([
    (0, common_1.Post)(':id/menu-keys'),
    (0, swagger_1.ApiOperation)({ summary: 'Set menu keys for a module definition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ModuleRegistryController.prototype, "setMenuKeys", null);
__decorate([
    (0, common_1.Get)(':id/dependencies'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the recursive dependency tree for a module' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ModuleRegistryController.prototype, "getDependencyTree", null);
__decorate([
    (0, common_1.Post)(':id/dependencies'),
    (0, swagger_1.ApiOperation)({ summary: 'Set dependency codes for a module definition' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ModuleRegistryController.prototype, "setDependencies", null);
__decorate([
    (0, common_1.Get)(':id/subscribers'),
    (0, swagger_1.ApiOperation)({ summary: 'List tenants subscribed to this module' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ModuleRegistryController.prototype, "getSubscribers", null);
exports.ModuleRegistryController = ModuleRegistryController = __decorate([
    (0, swagger_1.ApiTags)('Module Registry'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor/module-registry'),
    __metadata("design:paramtypes", [module_registry_service_1.ModuleRegistryService])
], ModuleRegistryController);
//# sourceMappingURL=module-registry.controller.js.map