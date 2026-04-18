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
exports.PageRegistryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const api_response_1 = require("../../../../../common/utils/api-response");
const page_registry_service_1 = require("../services/page-registry.service");
const page_scanner_service_1 = require("../services/page-scanner.service");
const page_menu_sync_service_1 = require("../services/page-menu-sync.service");
let PageRegistryController = class PageRegistryController {
    constructor(pageRegistry, pageScanner, pageMenuSync) {
        this.pageRegistry = pageRegistry;
        this.pageScanner = pageScanner;
        this.pageMenuSync = pageMenuSync;
    }
    async list(portal, category, pageType, moduleCode, search, page, limit) {
        const p = Math.max(Number(page) || 1, 1);
        const l = Math.min(Math.max(Number(limit) || 50, 1), 200);
        const { data, total } = await this.pageRegistry.list({
            portal,
            category,
            pageType,
            moduleCode,
            search,
            page: p,
            limit: l,
        });
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async stats() {
        const stats = await this.pageRegistry.getStats();
        return api_response_1.ApiResponse.success(stats);
    }
    async unassigned(portal, search, page, limit) {
        const p = Math.max(Number(page) || 1, 1);
        const l = Math.min(Math.max(Number(limit) || 50, 1), 200);
        const { data, total } = await this.pageRegistry.getUnassigned({
            portal,
            search,
            page: p,
            limit: l,
        });
        return api_response_1.ApiResponse.paginated(data, total, p, l);
    }
    async scan() {
        const result = await this.pageScanner.scanAndRegister();
        return api_response_1.ApiResponse.success(result, `Scanned ${result.total} pages (${result.created} new, ${result.updated} updated)`);
    }
    async getById(id) {
        const page = await this.pageRegistry.getById(id);
        return api_response_1.ApiResponse.success(page);
    }
    async update(id, body) {
        const page = await this.pageRegistry.update(id, body);
        return api_response_1.ApiResponse.success(page, 'Page updated');
    }
    async assign(id, body) {
        const page = await this.pageRegistry.assignToModule(id, body);
        return api_response_1.ApiResponse.success(page, 'Page assigned to module');
    }
    async bulkAssign(body) {
        const result = await this.pageRegistry.bulkAssign(body);
        return api_response_1.ApiResponse.success(result, `${result.updated} pages assigned`);
    }
    async unassign(id) {
        const page = await this.pageRegistry.unassignFromModule(id);
        return api_response_1.ApiResponse.success(page, 'Page unassigned from module');
    }
    async getModulePages(code) {
        const pages = await this.pageRegistry.getModulePages(code);
        return api_response_1.ApiResponse.success(pages);
    }
    async reorderModulePages(code, body) {
        const pages = await this.pageRegistry.reorderModulePages(code, body.orderedIds);
        return api_response_1.ApiResponse.success(pages, 'Pages reordered');
    }
    async syncMenus(code) {
        const result = await this.pageMenuSync.syncModulePages(code);
        return api_response_1.ApiResponse.success(result, `Synced ${result.synced} menu entries across ${result.tenants} tenants`);
    }
};
exports.PageRegistryController = PageRegistryController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all registered pages with filtering' }),
    __param(0, (0, common_1.Query)('portal')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('pageType')),
    __param(3, (0, common_1.Query)('moduleCode')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PageRegistryController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get page registry statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PageRegistryController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('unassigned'),
    (0, swagger_1.ApiOperation)({ summary: 'List pages not assigned to any module' }),
    __param(0, (0, common_1.Query)('portal')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PageRegistryController.prototype, "unassigned", null);
__decorate([
    (0, common_1.Post)('scan'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger a re-scan of all routes from filesystem' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PageRegistryController.prototype, "scan", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get page detail by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageRegistryController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update page metadata (friendly name, type, category, etc.)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PageRegistryController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a page to a module' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PageRegistryController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('bulk-assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk assign multiple pages to a module' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PageRegistryController.prototype, "bulkAssign", null);
__decorate([
    (0, common_1.Delete)(':id/unassign'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove page from its module' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageRegistryController.prototype, "unassign", null);
__decorate([
    (0, common_1.Get)('modules/:code/pages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all pages assigned to a module' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageRegistryController.prototype, "getModulePages", null);
__decorate([
    (0, common_1.Patch)('modules/:code/pages/reorder'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder pages within a module' }),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PageRegistryController.prototype, "reorderModulePages", null);
__decorate([
    (0, common_1.Post)('modules/:code/pages/sync-menus'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync module pages into the Menu table for all tenants' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PageRegistryController.prototype, "syncMenus", null);
exports.PageRegistryController = PageRegistryController = __decorate([
    (0, swagger_1.ApiTags)('Page Registry'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor/pages'),
    __metadata("design:paramtypes", [page_registry_service_1.PageRegistryService,
        page_scanner_service_1.PageScannerService,
        page_menu_sync_service_1.PageMenuSyncService])
], PageRegistryController);
//# sourceMappingURL=page-registry.controller.js.map