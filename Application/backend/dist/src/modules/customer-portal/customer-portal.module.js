"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerPortalModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const customer_auth_controller_1 = require("./presentation/customer-auth.controller");
const customer_portal_admin_controller_1 = require("./presentation/customer-portal-admin.controller");
const customer_auth_guard_1 = require("./infrastructure/guards/customer-auth.guard");
const prisma_customer_user_repository_1 = require("./infrastructure/repositories/prisma-customer-user.repository");
const customer_user_repository_interface_1 = require("./domain/interfaces/customer-user.repository.interface");
const customer_login_handler_1 = require("./application/commands/customer-login/customer-login.handler");
const refresh_customer_token_handler_1 = require("./application/commands/refresh-customer-token/refresh-customer-token.handler");
const forgot_customer_password_handler_1 = require("./application/commands/forgot-customer-password/forgot-customer-password.handler");
const reset_customer_password_handler_1 = require("./application/commands/reset-customer-password/reset-customer-password.handler");
const change_customer_password_handler_1 = require("./application/commands/change-customer-password/change-customer-password.handler");
const activate_portal_handler_1 = require("./application/commands/activate-portal/activate-portal.handler");
const deactivate_portal_handler_1 = require("./application/commands/deactivate-portal/deactivate-portal.handler");
const update_portal_user_handler_1 = require("./application/commands/update-portal-user/update-portal-user.handler");
const admin_reset_customer_password_handler_1 = require("./application/commands/admin-reset-customer-password/admin-reset-customer-password.handler");
const create_menu_category_handler_1 = require("./application/commands/create-menu-category/create-menu-category.handler");
const update_menu_category_handler_1 = require("./application/commands/update-menu-category/update-menu-category.handler");
const delete_menu_category_handler_1 = require("./application/commands/delete-menu-category/delete-menu-category.handler");
const get_customer_menu_handler_1 = require("./application/queries/get-customer-menu/get-customer-menu.handler");
const get_customer_profile_handler_1 = require("./application/queries/get-customer-profile/get-customer-profile.handler");
const get_eligible_entities_handler_1 = require("./application/queries/get-eligible-entities/get-eligible-entities.handler");
const list_portal_users_handler_1 = require("./application/queries/list-portal-users/list-portal-users.handler");
const get_portal_user_handler_1 = require("./application/queries/get-portal-user/get-portal-user.handler");
const list_menu_categories_handler_1 = require("./application/queries/list-menu-categories/list-menu-categories.handler");
const get_menu_category_handler_1 = require("./application/queries/get-menu-category/get-menu-category.handler");
const get_portal_analytics_handler_1 = require("./application/queries/get-portal-analytics/get-portal-analytics.handler");
const COMMAND_HANDLERS = [
    customer_login_handler_1.CustomerLoginHandler,
    refresh_customer_token_handler_1.RefreshCustomerTokenHandler,
    forgot_customer_password_handler_1.ForgotCustomerPasswordHandler,
    reset_customer_password_handler_1.ResetCustomerPasswordHandler,
    change_customer_password_handler_1.ChangeCustomerPasswordHandler,
    activate_portal_handler_1.ActivatePortalHandler,
    deactivate_portal_handler_1.DeactivatePortalHandler,
    update_portal_user_handler_1.UpdatePortalUserHandler,
    admin_reset_customer_password_handler_1.AdminResetCustomerPasswordHandler,
    create_menu_category_handler_1.CreateMenuCategoryHandler,
    update_menu_category_handler_1.UpdateMenuCategoryHandler,
    delete_menu_category_handler_1.DeleteMenuCategoryHandler,
];
const QUERY_HANDLERS = [
    get_customer_menu_handler_1.GetCustomerMenuHandler,
    get_customer_profile_handler_1.GetCustomerProfileHandler,
    get_eligible_entities_handler_1.GetEligibleEntitiesHandler,
    list_portal_users_handler_1.ListPortalUsersHandler,
    get_portal_user_handler_1.GetPortalUserHandler,
    list_menu_categories_handler_1.ListMenuCategoriesHandler,
    get_menu_category_handler_1.GetMenuCategoryHandler,
    get_portal_analytics_handler_1.GetPortalAnalyticsHandler,
];
let CustomerPortalModule = class CustomerPortalModule {
};
exports.CustomerPortalModule = CustomerPortalModule;
exports.CustomerPortalModule = CustomerPortalModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET'),
                    signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '24h') },
                }),
            }),
        ],
        controllers: [customer_auth_controller_1.CustomerAuthController, customer_portal_admin_controller_1.CustomerPortalAdminController],
        providers: [
            { provide: customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY, useClass: prisma_customer_user_repository_1.PrismaCustomerUserRepository },
            customer_auth_guard_1.CustomerAuthGuard,
            ...COMMAND_HANDLERS,
            ...QUERY_HANDLERS,
        ],
        exports: [customer_user_repository_interface_1.CUSTOMER_USER_REPOSITORY],
    })
], CustomerPortalModule);
//# sourceMappingURL=customer-portal.module.js.map