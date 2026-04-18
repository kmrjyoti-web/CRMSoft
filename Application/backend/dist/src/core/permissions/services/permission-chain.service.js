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
var PermissionChainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionChainService = void 0;
const common_1 = require("@nestjs/common");
const rbac_engine_1 = require("../engines/rbac.engine");
const ubac_engine_1 = require("../engines/ubac.engine");
const role_hierarchy_engine_1 = require("../engines/role-hierarchy.engine");
const dept_hierarchy_engine_1 = require("../engines/dept-hierarchy.engine");
const ownership_engine_1 = require("../engines/ownership.engine");
const maker_checker_engine_1 = require("../engines/maker-checker.engine");
const permission_error_1 = require("../types/permission-error");
let PermissionChainService = PermissionChainService_1 = class PermissionChainService {
    constructor(rbacEngine, ubacEngine, roleHierarchyEngine, deptHierarchyEngine, ownershipEngine, makerCheckerEngine) {
        this.rbacEngine = rbacEngine;
        this.ubacEngine = ubacEngine;
        this.roleHierarchyEngine = roleHierarchyEngine;
        this.deptHierarchyEngine = deptHierarchyEngine;
        this.ownershipEngine = ownershipEngine;
        this.makerCheckerEngine = makerCheckerEngine;
        this.logger = new common_1.Logger(PermissionChainService_1.name);
    }
    async can(ctx) {
        this.logger.debug(`Evaluating: ${ctx.action} for user ${ctx.userId}`);
        if (await this.ubacEngine.hasExplicitDeny(ctx)) {
            return { allowed: false, reason: 'UBAC_DENIED', deniedBy: 'UBAC' };
        }
        let failure = null;
        if (!(await this.rbacEngine.check(ctx))) {
            failure = { allowed: false, reason: 'RBAC_DENIED', deniedBy: 'RBAC' };
        }
        if (!failure && !(await this.roleHierarchyEngine.check(ctx))) {
            failure = { allowed: false, reason: 'ROLE_LEVEL_DENIED', deniedBy: 'ROLE_HIERARCHY' };
        }
        if (!failure && !(await this.deptHierarchyEngine.check(ctx))) {
            failure = { allowed: false, reason: 'DEPT_HIERARCHY_DENIED', deniedBy: 'DEPT_HIERARCHY' };
        }
        if (!failure && !(await this.ownershipEngine.check(ctx))) {
            failure = { allowed: false, reason: 'OWNERSHIP_DENIED', deniedBy: 'OWNERSHIP' };
        }
        if (failure) {
            if (await this.ubacEngine.hasExplicitGrant(ctx)) {
                this.logger.debug(`UBAC GRANT rescued denial: ${failure.reason}`);
                failure = null;
            }
            else {
                this.logger.debug(`Denied: ${failure.reason} [${failure.deniedBy}]`);
                return failure;
            }
        }
        const approval = await this.makerCheckerEngine.requiresApproval(ctx);
        if (approval.required) {
            return {
                allowed: true,
                makerChecker: {
                    requiresApproval: true,
                    checkerRole: approval.checkerRole,
                },
            };
        }
        return { allowed: true };
    }
    async canOrThrow(ctx) {
        const result = await this.can(ctx);
        if (!result.allowed) {
            throw new permission_error_1.PermissionError(result.reason, ctx.action, result.deniedBy);
        }
        return result.makerChecker || null;
    }
    async canAll(contexts) {
        for (const ctx of contexts) {
            const result = await this.can(ctx);
            if (!result.allowed)
                return false;
        }
        return true;
    }
    async canAny(contexts) {
        for (const ctx of contexts) {
            const result = await this.can(ctx);
            if (result.allowed)
                return true;
        }
        return false;
    }
    async getEffectivePermissions(userId) {
        return this.roleHierarchyEngine.getEffectivePermissions(userId);
    }
    async getAllPermissionCodes() {
        return this.roleHierarchyEngine.getAllPermissionCodes();
    }
    invalidateAll() {
        this.rbacEngine.invalidateAll();
        this.ubacEngine.invalidateAll();
        this.roleHierarchyEngine.invalidateAll();
    }
};
exports.PermissionChainService = PermissionChainService;
exports.PermissionChainService = PermissionChainService = PermissionChainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rbac_engine_1.RbacEngine,
        ubac_engine_1.UbacEngine,
        role_hierarchy_engine_1.RoleHierarchyEngine,
        dept_hierarchy_engine_1.DeptHierarchyEngine,
        ownership_engine_1.OwnershipEngine,
        maker_checker_engine_1.MakerCheckerEngine])
], PermissionChainService);
//# sourceMappingURL=permission-chain.service.js.map