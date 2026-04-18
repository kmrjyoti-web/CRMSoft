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
exports.MenuManagementController = void 0;
const common_1 = require("@nestjs/common");
const menu_management_service_1 = require("./menu-management.service");
const create_menu_item_dto_1 = require("./dto/create-menu-item.dto");
const update_menu_item_dto_1 = require("./dto/update-menu-item.dto");
const set_brand_override_dto_1 = require("./dto/set-brand-override.dto");
let MenuManagementController = class MenuManagementController {
    constructor(menuManagementService) {
        this.menuManagementService = menuManagementService;
    }
    getMenuFlat() {
        return this.menuManagementService.getMenuFlat();
    }
    getMenuTree() {
        return this.menuManagementService.getMenuTree();
    }
    createMenuItem(dto) {
        return this.menuManagementService.createMenuItem(dto);
    }
    reorderMenuItems(body) {
        return this.menuManagementService.reorderMenuItems(body);
    }
    getMenuWithBrandOverrides(brandId) {
        return this.menuManagementService.getMenuWithBrandOverrides(brandId);
    }
    setBrandOverride(brandId, dto) {
        return this.menuManagementService.setBrandOverride(brandId, dto);
    }
    updateBrandOverride(id, body) {
        return this.menuManagementService.updateBrandOverride(id, body);
    }
    removeBrandOverride(id) {
        return this.menuManagementService.removeBrandOverride(id);
    }
    getBrandOverrides(brandId) {
        return this.menuManagementService.getBrandOverrides(brandId);
    }
    previewMenu(brandId) {
        return this.menuManagementService.previewMenu(brandId);
    }
    previewMenuWithRole(brandId, role) {
        return this.menuManagementService.previewMenu(brandId, role);
    }
    updateMenuItem(id, dto) {
        return this.menuManagementService.updateMenuItem(id, dto);
    }
    deleteMenuItem(id) {
        return this.menuManagementService.deleteMenuItem(id);
    }
};
exports.MenuManagementController = MenuManagementController;
__decorate([
    (0, common_1.Get)('flat'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "getMenuFlat", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "getMenuTree", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_menu_item_dto_1.CreateMenuItemDto]),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "createMenuItem", null);
__decorate([
    (0, common_1.Post)('reorder'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "reorderMenuItems", null);
__decorate([
    (0, common_1.Get)('brands/:brandId'),
    __param(0, (0, common_1.Param)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "getMenuWithBrandOverrides", null);
__decorate([
    (0, common_1.Post)('brands/:brandId/override'),
    __param(0, (0, common_1.Param)('brandId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_brand_override_dto_1.SetBrandOverrideDto]),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "setBrandOverride", null);
__decorate([
    (0, common_1.Patch)('brands/:brandId/override/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "updateBrandOverride", null);
__decorate([
    (0, common_1.Delete)('brands/:brandId/override/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "removeBrandOverride", null);
__decorate([
    (0, common_1.Get)('brands/:brandId/overrides'),
    __param(0, (0, common_1.Param)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "getBrandOverrides", null);
__decorate([
    (0, common_1.Get)('preview/:brandId'),
    __param(0, (0, common_1.Param)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "previewMenu", null);
__decorate([
    (0, common_1.Get)('preview/:brandId/:role'),
    __param(0, (0, common_1.Param)('brandId')),
    __param(1, (0, common_1.Param)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "previewMenuWithRole", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_menu_item_dto_1.UpdateMenuItemDto]),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "updateMenuItem", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenuManagementController.prototype, "deleteMenuItem", null);
exports.MenuManagementController = MenuManagementController = __decorate([
    (0, common_1.Controller)('platform-console/menus'),
    __metadata("design:paramtypes", [menu_management_service_1.MenuManagementService])
], MenuManagementController);
//# sourceMappingURL=menu-management.controller.js.map