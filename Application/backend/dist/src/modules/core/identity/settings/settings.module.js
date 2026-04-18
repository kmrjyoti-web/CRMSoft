"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const prisma_module_1 = require("../../../../core/prisma/prisma.module");
const auto_number_service_1 = require("./services/auto-number.service");
const business_hours_service_1 = require("./services/business-hours.service");
const holiday_service_1 = require("./services/holiday.service");
const branding_service_1 = require("./services/branding.service");
const domain_verifier_service_1 = require("./services/domain-verifier.service");
const notification_pref_service_1 = require("./services/notification-pref.service");
const company_profile_service_1 = require("./services/company-profile.service");
const security_policy_service_1 = require("./services/security-policy.service");
const data_retention_service_1 = require("./services/data-retention.service");
const email_footer_service_1 = require("./services/email-footer.service");
const settings_seeder_service_1 = require("./services/settings-seeder.service");
const notion_sync_service_1 = require("./services/notion-sync.service");
const religious_mode_service_1 = require("./services/religious-mode.service");
const religious_mode_controller_1 = require("./presentation/religious-mode.controller");
const branding_controller_1 = require("./presentation/branding.controller");
const business_hours_controller_1 = require("./presentation/business-hours.controller");
const holiday_controller_1 = require("./presentation/holiday.controller");
const auto_number_controller_1 = require("./presentation/auto-number.controller");
const company_profile_controller_1 = require("./presentation/company-profile.controller");
const notification_pref_controller_1 = require("./presentation/notification-pref.controller");
const security_policy_controller_1 = require("./presentation/security-policy.controller");
const data_retention_controller_1 = require("./presentation/data-retention.controller");
const email_footer_controller_1 = require("./presentation/email-footer.controller");
const notion_controller_1 = require("./presentation/notion.controller");
const users_controller_1 = require("./presentation/users.controller");
const roles_controller_1 = require("./presentation/roles.controller");
const permissions_controller_1 = require("./presentation/permissions.controller");
const soft_delete_user_handler_1 = require("./application/commands/soft-delete-user/soft-delete-user.handler");
const restore_user_handler_1 = require("./application/commands/restore-user/restore-user.handler");
const permanent_delete_user_handler_1 = require("./application/commands/permanent-delete-user/permanent-delete-user.handler");
const list_users_handler_1 = require("./application/queries/list-users/list-users.handler");
const get_user_handler_1 = require("./application/queries/get-user/get-user.handler");
const list_roles_handler_1 = require("./application/queries/list-roles/list-roles.handler");
const get_role_handler_1 = require("./application/queries/get-role/get-role.handler");
const list_permissions_handler_1 = require("./application/queries/list-permissions/list-permissions.handler");
const SERVICES = [
    religious_mode_service_1.ReligiousModeService,
    auto_number_service_1.AutoNumberService,
    business_hours_service_1.BusinessHoursService,
    holiday_service_1.HolidayService,
    branding_service_1.BrandingService,
    domain_verifier_service_1.DomainVerifierService,
    notification_pref_service_1.NotificationPrefService,
    company_profile_service_1.CompanyProfileService,
    security_policy_service_1.SecurityPolicyService,
    data_retention_service_1.DataRetentionService,
    email_footer_service_1.EmailFooterService,
    settings_seeder_service_1.SettingsSeederService,
    notion_sync_service_1.NotionSyncService,
];
const UserCommandHandlers = [
    soft_delete_user_handler_1.SoftDeleteUserHandler,
    restore_user_handler_1.RestoreUserHandler,
    permanent_delete_user_handler_1.PermanentDeleteUserHandler,
];
const UserQueryHandlers = [
    list_users_handler_1.ListUsersHandler,
    get_user_handler_1.GetUserHandler,
    list_roles_handler_1.ListRolesHandler,
    get_role_handler_1.GetRoleHandler,
    list_permissions_handler_1.ListPermissionsHandler,
];
const CONTROLLERS = [
    religious_mode_controller_1.ReligiousModeController,
    branding_controller_1.BrandingController,
    business_hours_controller_1.BusinessHoursController,
    holiday_controller_1.HolidayController,
    auto_number_controller_1.AutoNumberController,
    company_profile_controller_1.CompanyProfileController,
    notification_pref_controller_1.NotificationPrefController,
    security_policy_controller_1.SecurityPolicyController,
    data_retention_controller_1.DataRetentionController,
    email_footer_controller_1.EmailFooterController,
    notion_controller_1.NotionController,
    users_controller_1.UsersController,
    roles_controller_1.RolesController,
    permissions_controller_1.PermissionsController,
];
let SettingsModule = class SettingsModule {
};
exports.SettingsModule = SettingsModule;
exports.SettingsModule = SettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            prisma_module_1.PrismaModule,
            platform_express_1.MulterModule.register({ storage: (0, multer_1.memoryStorage)() }),
        ],
        controllers: CONTROLLERS,
        providers: [...SERVICES, ...UserCommandHandlers, ...UserQueryHandlers],
        exports: [
            auto_number_service_1.AutoNumberService,
            business_hours_service_1.BusinessHoursService,
            holiday_service_1.HolidayService,
            notification_pref_service_1.NotificationPrefService,
            security_policy_service_1.SecurityPolicyService,
            settings_seeder_service_1.SettingsSeederService,
            branding_service_1.BrandingService,
            company_profile_service_1.CompanyProfileService,
        ],
    })
], SettingsModule);
//# sourceMappingURL=settings.module.js.map