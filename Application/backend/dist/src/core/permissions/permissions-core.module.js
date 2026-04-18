"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsCoreModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rbac_engine_1 = require("./engines/rbac.engine");
const ubac_engine_1 = require("./engines/ubac.engine");
const role_hierarchy_engine_1 = require("./engines/role-hierarchy.engine");
const dept_hierarchy_engine_1 = require("./engines/dept-hierarchy.engine");
const ownership_engine_1 = require("./engines/ownership.engine");
const maker_checker_engine_1 = require("./engines/maker-checker.engine");
const permission_chain_service_1 = require("./services/permission-chain.service");
const permission_cache_service_1 = require("./services/permission-cache.service");
const permission_policy_guard_1 = require("./guards/permission-policy.guard");
const ownership_guard_1 = require("./guards/ownership.guard");
const menu_permission_guard_1 = require("./guards/menu-permission.guard");
const menus_module_1 = require("../../modules/core/identity/menus/menus.module");
let PermissionsCoreModule = class PermissionsCoreModule {
};
exports.PermissionsCoreModule = PermissionsCoreModule;
exports.PermissionsCoreModule = PermissionsCoreModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [menus_module_1.MenusModule],
        providers: [
            rbac_engine_1.RbacEngine,
            ubac_engine_1.UbacEngine,
            role_hierarchy_engine_1.RoleHierarchyEngine,
            dept_hierarchy_engine_1.DeptHierarchyEngine,
            ownership_engine_1.OwnershipEngine,
            maker_checker_engine_1.MakerCheckerEngine,
            permission_chain_service_1.PermissionChainService,
            permission_cache_service_1.PermissionCacheService,
            permission_policy_guard_1.PermissionPolicyGuard,
            ownership_guard_1.OwnershipGuard,
            menu_permission_guard_1.MenuPermissionGuard,
            { provide: core_1.APP_GUARD, useClass: permission_policy_guard_1.PermissionPolicyGuard },
        ],
        exports: [
            rbac_engine_1.RbacEngine,
            ubac_engine_1.UbacEngine,
            role_hierarchy_engine_1.RoleHierarchyEngine,
            dept_hierarchy_engine_1.DeptHierarchyEngine,
            ownership_engine_1.OwnershipEngine,
            maker_checker_engine_1.MakerCheckerEngine,
            permission_chain_service_1.PermissionChainService,
            permission_cache_service_1.PermissionCacheService,
            permission_policy_guard_1.PermissionPolicyGuard,
            ownership_guard_1.OwnershipGuard,
            menu_permission_guard_1.MenuPermissionGuard,
        ],
    })
], PermissionsCoreModule);
//# sourceMappingURL=permissions-core.module.js.map