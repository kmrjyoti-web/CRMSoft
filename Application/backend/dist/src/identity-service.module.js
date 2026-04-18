"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityServiceModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cqrs_1 = require("@nestjs/cqrs");
const prisma_module_1 = require("./core/prisma/prisma.module");
const errors_module_1 = require("./common/errors/errors.module");
const auth_module_1 = require("./core/auth/auth.module");
const permissions_core_module_1 = require("./core/permissions/permissions-core.module");
const tenant_module_1 = require("./modules/core/identity/tenant/tenant.module");
const menus_module_1 = require("./modules/core/identity/menus/menus.module");
const audit_module_1 = require("./modules/core/identity/audit/audit.module");
const settings_module_1 = require("./modules/core/identity/settings/settings.module");
const entity_filters_module_1 = require("./modules/core/identity/entity-filters/entity-filters.module");
let IdentityServiceModule = class IdentityServiceModule {
};
exports.IdentityServiceModule = IdentityServiceModule;
exports.IdentityServiceModule = IdentityServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            cqrs_1.CqrsModule.forRoot(),
            prisma_module_1.PrismaModule,
            errors_module_1.ErrorsModule,
            auth_module_1.AuthModule,
            permissions_core_module_1.PermissionsCoreModule,
            tenant_module_1.TenantModule,
            menus_module_1.MenusModule,
            audit_module_1.AuditModule,
            settings_module_1.SettingsModule,
            entity_filters_module_1.EntityFiltersModule,
        ],
    })
], IdentityServiceModule);
//# sourceMappingURL=identity-service.module.js.map