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
exports.MenuPermissionController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../../common/utils/api-response");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const menu_permission_service_1 = require("../application/services/menu-permission.service");
let MenuPermissionController = class MenuPermissionController {
    constructor(menuPermissionService, prisma) {
        this.menuPermissionService = menuPermissionService;
        this.prisma = prisma;
    }
    async getRolePermissions(roleId, tenantId) {
        const perms = await this.menuPermissionService.getAllPermissionsForRole(tenantId, roleId);
        return api_response_1.ApiResponse.success(Array.from(perms.values()));
    }
    async getMenuPermission(roleId, menuCode, tenantId) {
        const perm = await this.menuPermissionService.getPermissions(tenantId, roleId, menuCode);
        return api_response_1.ApiResponse.success(perm);
    }
    async getMatrix(roleId, tenantId) {
        const matrix = await this.menuPermissionService.getMatrix(tenantId, roleId);
        return api_response_1.ApiResponse.success(matrix);
    }
    async getFullMatrix(tenantId) {
        const matrix = await this.menuPermissionService.getFullMatrix(tenantId);
        return api_response_1.ApiResponse.success(matrix);
    }
    async setMenuPermission(roleId, menuId, body, tenantId, userId) {
        const { menuCode, ...permissions } = body;
        const result = await this.menuPermissionService.setPermissions(tenantId, roleId, menuId, menuCode, permissions, userId);
        return api_response_1.ApiResponse.success(result, 'Menu permission updated');
    }
    async bulkSet(roleId, body, tenantId, userId) {
        const count = await this.menuPermissionService.bulkSetPermissions(tenantId, roleId, body.permissions, userId);
        return api_response_1.ApiResponse.success({ count }, `${count} menu permissions updated`);
    }
    async copy(body, tenantId, userId) {
        const count = await this.menuPermissionService.copyPermissions(tenantId, body.sourceRoleId, body.targetRoleId, userId);
        return api_response_1.ApiResponse.success({ count }, `${count} permissions copied`);
    }
    async getTemplates(tenantId) {
        const templates = await this.menuPermissionService.getTemplates(tenantId);
        return api_response_1.ApiResponse.success(templates);
    }
    async createTemplate(body, tenantId) {
        const template = await this.prisma.identity.permissionTemplate.create({
            data: {
                tenantId,
                name: body.name,
                code: body.code,
                description: body.description,
                permissions: body.permissions,
            },
        });
        return api_response_1.ApiResponse.success(template, 'Template created');
    }
    async applyTemplate(body, tenantId, userId) {
        const count = await this.menuPermissionService.applyTemplate(tenantId, body.roleId, body.templateId, userId);
        return api_response_1.ApiResponse.success({ count }, `Template applied to ${count} menus`);
    }
    async checkPermission(menuCode, action, user) {
        const allowed = await this.menuPermissionService.hasPermission(user.tenantId, user.roleId, menuCode, action, user.role || user.roleName);
        return api_response_1.ApiResponse.success({ allowed, menuCode, action });
    }
    async getRestrictedFields(menuCode, user) {
        const fields = await this.menuPermissionService.getRestrictedFields(user.tenantId, user.roleId, menuCode);
        return api_response_1.ApiResponse.success(fields);
    }
    async deleteRolePermissions(roleId, tenantId) {
        const count = await this.menuPermissionService.deleteRolePermissions(tenantId, roleId);
        return api_response_1.ApiResponse.success({ count }, `${count} menu permissions deleted`);
    }
    async deleteMenuPermission(roleId, menuId, tenantId) {
        await this.menuPermissionService.deleteMenuPermission(tenantId, roleId, menuId);
        return api_response_1.ApiResponse.success(null, 'Menu permission deleted');
    }
    async clearCache(tenantId) {
        this.menuPermissionService.invalidateTenantCache(tenantId);
        return api_response_1.ApiResponse.success(null, 'Cache cleared');
    }
};
exports.MenuPermissionController = MenuPermissionController;
__decorate([
    (0, common_1.Get)('role/:roleId'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:read'),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "getRolePermissions", null);
__decorate([
    (0, common_1.Get)('role/:roleId/menu/:menuCode'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:read'),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Param)('menuCode')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "getMenuPermission", null);
__decorate([
    (0, common_1.Get)('matrix/:roleId'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:read'),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "getMatrix", null);
__decorate([
    (0, common_1.Get)('matrix'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "getFullMatrix", null);
__decorate([
    (0, common_1.Put)('role/:roleId/menu/:menuId'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:update'),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(4, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "setMenuPermission", null);
__decorate([
    (0, common_1.Put)('role/:roleId/bulk'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:update'),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "bulkSet", null);
__decorate([
    (0, common_1.Post)('copy'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:update'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "copy", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Post)('templates/apply'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:update'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "applyTemplate", null);
__decorate([
    (0, common_1.Get)('check'),
    __param(0, (0, common_1.Query)('menuCode')),
    __param(1, (0, common_1.Query)('action')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "checkPermission", null);
__decorate([
    (0, common_1.Get)('restricted-fields'),
    __param(0, (0, common_1.Query)('menuCode')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "getRestrictedFields", null);
__decorate([
    (0, common_1.Delete)('role/:roleId'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:update'),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "deleteRolePermissions", null);
__decorate([
    (0, common_1.Delete)('role/:roleId/menu/:menuId'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:update'),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "deleteMenuPermission", null);
__decorate([
    (0, common_1.Post)('cache/clear'),
    (0, require_permissions_decorator_1.RequirePermissions)('roles:update'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuPermissionController.prototype, "clearCache", null);
exports.MenuPermissionController = MenuPermissionController = __decorate([
    (0, common_1.Controller)('menu-permissions'),
    __metadata("design:paramtypes", [menu_permission_service_1.MenuPermissionService,
        prisma_service_1.PrismaService])
], MenuPermissionController);
//# sourceMappingURL=menu-permission.controller.js.map