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
exports.CustomerPortalAdminController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const portal_routes_1 = require("../data/portal-routes");
const activate_portal_dto_1 = require("./dto/activate-portal.dto");
const create_menu_category_dto_1 = require("./dto/create-menu-category.dto");
const update_menu_category_dto_1 = require("./dto/update-menu-category.dto");
const update_portal_user_dto_1 = require("./dto/update-portal-user.dto");
const activate_portal_command_1 = require("../application/commands/activate-portal/activate-portal.command");
const deactivate_portal_command_1 = require("../application/commands/deactivate-portal/deactivate-portal.command");
const update_portal_user_command_1 = require("../application/commands/update-portal-user/update-portal-user.command");
const admin_reset_customer_password_command_1 = require("../application/commands/admin-reset-customer-password/admin-reset-customer-password.command");
const create_menu_category_command_1 = require("../application/commands/create-menu-category/create-menu-category.command");
const update_menu_category_command_1 = require("../application/commands/update-menu-category/update-menu-category.command");
const delete_menu_category_command_1 = require("../application/commands/delete-menu-category/delete-menu-category.command");
const get_eligible_entities_query_1 = require("../application/queries/get-eligible-entities/get-eligible-entities.query");
const list_portal_users_query_1 = require("../application/queries/list-portal-users/list-portal-users.query");
const get_portal_user_query_1 = require("../application/queries/get-portal-user/get-portal-user.query");
const list_menu_categories_query_1 = require("../application/queries/list-menu-categories/list-menu-categories.query");
const get_menu_category_query_1 = require("../application/queries/get-menu-category/get-menu-category.query");
const get_portal_analytics_query_1 = require("../application/queries/get-portal-analytics/get-portal-analytics.query");
let CustomerPortalAdminController = class CustomerPortalAdminController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    getEligibleEntities(req, entityType, search, page = '1', limit = '20') {
        return this.queryBus.execute(new get_eligible_entities_query_1.GetEligibleEntitiesQuery(req.user.tenantId, entityType, search, parseInt(page, 10), parseInt(limit, 10)));
    }
    activate(req, dto) {
        return this.commandBus.execute(new activate_portal_command_1.ActivatePortalCommand(req.user.tenantId, req.user.id, dto.entityType, dto.entityId, dto.menuCategoryId));
    }
    deactivate(customerUserId, req) {
        return this.commandBus.execute(new deactivate_portal_command_1.DeactivatePortalCommand(req.user.tenantId, customerUserId));
    }
    listPortalUsers(req, page = '1', limit = '20', search, isActive) {
        return this.queryBus.execute(new list_portal_users_query_1.ListPortalUsersQuery(req.user.tenantId, parseInt(page, 10), parseInt(limit, 10), search, isActive !== undefined ? isActive === 'true' : undefined));
    }
    getPortalUser(id) {
        return this.queryBus.execute(new get_portal_user_query_1.GetPortalUserQuery(id));
    }
    updatePortalUser(id, dto) {
        return this.commandBus.execute(new update_portal_user_command_1.UpdatePortalUserCommand(id, dto.menuCategoryId, dto.pageOverrides, dto.isActive));
    }
    resetPassword(id) {
        return this.commandBus.execute(new admin_reset_customer_password_command_1.AdminResetCustomerPasswordCommand(id));
    }
    createMenuCategory(req, dto) {
        return this.commandBus.execute(new create_menu_category_command_1.CreateMenuCategoryCommand(req.user.tenantId, req.user.id, dto.name, dto.enabledRoutes, dto.nameHi, dto.description, dto.icon, dto.color, dto.isDefault, dto.sortOrder));
    }
    listMenuCategories(req) {
        return this.queryBus.execute(new list_menu_categories_query_1.ListMenuCategoriesQuery(req.user.tenantId));
    }
    getMenuCategory(id) {
        return this.queryBus.execute(new get_menu_category_query_1.GetMenuCategoryQuery(id));
    }
    updateMenuCategory(id, dto) {
        return this.commandBus.execute(new update_menu_category_command_1.UpdateMenuCategoryCommand(id, dto));
    }
    deleteMenuCategory(id) {
        return this.commandBus.execute(new delete_menu_category_command_1.DeleteMenuCategoryCommand(id));
    }
    getAvailableRoutes() {
        return portal_routes_1.CUSTOMER_PORTAL_ROUTES.map((r) => ({
            key: r.route,
            label: r.name,
            icon: r.icon,
            path: r.route,
        }));
    }
    getAnalytics(req, from, to) {
        return this.queryBus.execute(new get_portal_analytics_query_1.GetPortalAnalyticsQuery(req.user.tenantId, from, to));
    }
};
exports.CustomerPortalAdminController = CustomerPortalAdminController;
__decorate([
    (0, common_1.Get)('eligible'),
    (0, swagger_1.ApiOperation)({ summary: 'Get verified entities eligible for portal activation' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', required: false, enum: ['CONTACT', 'ORGANIZATION', 'LEDGER'] }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('entityType')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "getEligibleEntities", null);
__decorate([
    (0, common_1.Post)('activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate portal login for a verified entity' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, activate_portal_dto_1.ActivatePortalDto]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)('deactivate/:customerUserId'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate portal access for a customer' }),
    __param(0, (0, common_1.Param)('customerUserId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'List all activated portal users' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "listPortalUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get portal user detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "getPortalUser", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update portal user (category, overrides, status)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_portal_user_dto_1.UpdatePortalUserDto]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "updatePortalUser", null);
__decorate([
    (0, common_1.Post)('users/:id/reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin reset customer password — sends new credentials' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('menu-categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a menu category' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_menu_category_dto_1.CreateMenuCategoryDto]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "createMenuCategory", null);
__decorate([
    (0, common_1.Get)('menu-categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List all menu categories' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "listMenuCategories", null);
__decorate([
    (0, common_1.Get)('menu-categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get menu category detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "getMenuCategory", null);
__decorate([
    (0, common_1.Patch)('menu-categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update menu category' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_menu_category_dto_1.UpdateMenuCategoryDto]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "updateMenuCategory", null);
__decorate([
    (0, common_1.Delete)('menu-categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete menu category (soft delete, fails if users assigned)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "deleteMenuCategory", null);
__decorate([
    (0, common_1.Get)('available-routes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all available customer portal pages (for menu builder UI)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "getAvailableRoutes", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Portal usage analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, description: 'ISO date string' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, description: 'ISO date string' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CustomerPortalAdminController.prototype, "getAnalytics", null);
exports.CustomerPortalAdminController = CustomerPortalAdminController = __decorate([
    (0, swagger_1.ApiTags)('Customer Portal — Admin Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/customer-portal'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], CustomerPortalAdminController);
//# sourceMappingURL=customer-portal-admin.controller.js.map