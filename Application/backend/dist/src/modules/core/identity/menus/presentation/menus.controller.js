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
exports.MenusController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const current_user_decorator_1 = require("../../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../../common/utils/api-response");
const create_menu_dto_1 = require("./dto/create-menu.dto");
const update_menu_dto_1 = require("./dto/update-menu.dto");
const reorder_menus_dto_1 = require("./dto/reorder-menus.dto");
const create_menu_command_1 = require("../application/commands/create-menu/create-menu.command");
const update_menu_command_1 = require("../application/commands/update-menu/update-menu.command");
const reorder_menus_command_1 = require("../application/commands/reorder-menus/reorder-menus.command");
const deactivate_menu_command_1 = require("../application/commands/deactivate-menu/deactivate-menu.command");
const bulk_seed_menus_command_1 = require("../application/commands/bulk-seed-menus/bulk-seed-menus.command");
const get_menu_tree_query_1 = require("../application/queries/get-menu-tree/get-menu-tree.query");
const get_my_menu_query_1 = require("../application/queries/get-my-menu/get-my-menu.query");
const get_menu_by_id_query_1 = require("../application/queries/get-menu-by-id/get-menu-by-id.query");
const menu_seed_data_1 = require("./menu-seed-data");
let MenusController = class MenusController {
    constructor(commandBus, queryBus, prisma) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.prisma = prisma;
    }
    async create(dto) {
        const result = await this.commandBus.execute(new create_menu_command_1.CreateMenuCommand(dto.name, dto.code, dto.icon, dto.route, dto.parentId, dto.sortOrder, dto.menuType, dto.permissionModule, dto.permissionAction, dto.badgeColor, dto.badgeText, dto.openInNewTab));
        return api_response_1.ApiResponse.success(result, 'Menu created');
    }
    async getTree(user) {
        const result = await this.queryBus.execute(new get_menu_tree_query_1.GetMenuTreeQuery(true, user.tenantId, user.isSuperAdmin));
        return api_response_1.ApiResponse.success(result);
    }
    async getMyMenu(user) {
        const result = await this.queryBus.execute(new get_my_menu_query_1.GetMyMenuQuery(user.id, user.roleId, user.role, user.isSuperAdmin, user.tenantId, user.businessTypeCode));
        return api_response_1.ApiResponse.success(result);
    }
    async getById(id) {
        const result = await this.queryBus.execute(new get_menu_by_id_query_1.GetMenuByIdQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto) {
        const result = await this.commandBus.execute(new update_menu_command_1.UpdateMenuCommand(id, dto));
        return api_response_1.ApiResponse.success(result, 'Menu updated');
    }
    async deactivate(id) {
        const result = await this.commandBus.execute(new deactivate_menu_command_1.DeactivateMenuCommand(id));
        return api_response_1.ApiResponse.success(result, 'Menu deactivated');
    }
    async reorder(dto) {
        const result = await this.commandBus.execute(new reorder_menus_command_1.ReorderMenusCommand(dto.parentId ?? null, dto.orderedIds));
        return api_response_1.ApiResponse.success(result, 'Menus reordered');
    }
    async seed(user) {
        const result = await this.commandBus.execute(new bulk_seed_menus_command_1.BulkSeedMenusCommand(menu_seed_data_1.MENU_SEED_DATA, user.tenantId, user.isSuperAdmin));
        return api_response_1.ApiResponse.success(result, 'Menus seeded');
    }
    async getDiscovery(user) {
        const tenantId = user.tenantId || await this.getDefaultTenantId();
        const menus = await this.prisma.identity.menu.findMany({
            where: { tenantId, isActive: true },
            select: { route: true, code: true, isAdminOnly: true },
        });
        const menuRoutes = new Set(menus.filter(m => m.route && !m.isAdminOnly).map(m => m.route.split('?')[0]));
        const unmappedGroup = await this.prisma.identity.menu.findFirst({
            where: { tenantId, code: '_UNMAPPED', isActive: true },
        });
        const unmappedItems = unmappedGroup
            ? await this.prisma.identity.menu.findMany({
                where: { tenantId, isAdminOnly: true, route: { not: null }, isActive: true },
                select: { route: true, name: true, code: true },
            })
            : [];
        const categories = {};
        for (const item of unmappedItems) {
            const cat = this.getRouteCategory(item.route);
            if (!categories[cat])
                categories[cat] = [];
            categories[cat].push({ route: item.route, name: item.name, category: cat });
        }
        return api_response_1.ApiResponse.success({
            totalRoutes: menuRoutes.size + unmappedItems.length,
            mappedRoutes: menuRoutes.size,
            unmappedRoutes: unmappedItems.map(i => ({
                route: i.route,
                name: i.name,
                category: this.getRouteCategory(i.route),
            })),
            categories,
        });
    }
    async refreshDiscovery(user) {
        const tenantId = user.tenantId || await this.getDefaultTenantId();
        const unmappedGroup = await this.prisma.identity.menu.findFirst({
            where: { tenantId, code: '_UNMAPPED', isActive: true },
        });
        const unmappedCount = unmappedGroup
            ? await this.prisma.identity.menu.count({ where: { tenantId, isAdminOnly: true, route: { not: null }, isActive: true } })
            : 0;
        return api_response_1.ApiResponse.success({ unmapped: unmappedCount, message: 'Run node scripts/create-unmapped-menu.js to refresh.' }, 'Discovery info');
    }
    getRouteCategory(route) {
        const map = [
            ['/accounts', 'Accounts'], ['/admin', 'Admin'], ['/campaigns', 'Communication'],
            ['/communication', 'Communication'], ['/demos', 'CRM'], ['/email', 'Communication'],
            ['/finance', 'Finance'], ['/import', 'Tools'], ['/inventory', 'Inventory'],
            ['/master', 'Master'], ['/notifications', 'Settings'], ['/onboarding', 'Settings'],
            ['/ownership', 'Settings'], ['/performance', 'CRM'], ['/plugins', 'Tools'],
            ['/post-sales', 'Support'], ['/pricing', 'Master'], ['/procurement', 'Purchase'],
            ['/products', 'Master'], ['/recycle-bin', 'Tools'], ['/reports', 'Reports'],
            ['/sales', 'Sale'], ['/settings', 'Settings'], ['/support', 'Support'],
            ['/whatsapp', 'Communication'], ['/workflows', 'Tools'],
        ];
        for (const [prefix, cat] of map) {
            if (route.startsWith(prefix))
                return cat;
        }
        return 'Other';
    }
    async getDefaultTenantId() {
        const t = await this.prisma.identity.tenant.findFirst({ where: { slug: 'default' } });
        return t?.id ?? '';
    }
};
exports.MenusController = MenusController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_menu_dto_1.CreateMenuDto]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('tree'),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "getTree", null);
__decorate([
    (0, common_1.Get)('my-menu'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "getMyMenu", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_menu_dto_1.UpdateMenuDto]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)('reorder'),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reorder_menus_dto_1.ReorderMenusDto]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "reorder", null);
__decorate([
    (0, common_1.Post)('seed'),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "seed", null);
__decorate([
    (0, common_1.Get)('discovery'),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "getDiscovery", null);
__decorate([
    (0, common_1.Post)('discovery/refresh'),
    (0, require_permissions_decorator_1.RequirePermissions)('menus:create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "refreshDiscovery", null);
exports.MenusController = MenusController = __decorate([
    (0, common_1.Controller)('menus'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        prisma_service_1.PrismaService])
], MenusController);
//# sourceMappingURL=menus.controller.js.map