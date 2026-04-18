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
var PermissionPolicyGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionPolicyGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permission_chain_service_1 = require("../services/permission-chain.service");
const require_permissions_decorator_1 = require("../decorators/require-permissions.decorator");
const require_ownership_decorator_1 = require("../decorators/require-ownership.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const permission_error_1 = require("../types/permission-error");
let PermissionPolicyGuard = PermissionPolicyGuard_1 = class PermissionPolicyGuard {
    constructor(reflector, permissionChain) {
        this.reflector = reflector;
        this.permissionChain = permissionChain;
        this.logger = new common_1.Logger(PermissionPolicyGuard_1.name);
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(roles_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(), context.getClass(),
        ]);
        if (isPublic)
            return true;
        const permissions = this.reflector.getAllAndOverride(require_permissions_decorator_1.PERMISSIONS_KEY, [
            context.getHandler(), context.getClass(),
        ]);
        if (!permissions || permissions.length === 0)
            return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user)
            throw new permission_error_1.PermissionError('AUTH_REQUIRED', permissions[0]);
        if (user.isSuperAdmin)
            return true;
        const ownershipMeta = this.reflector.get(require_ownership_decorator_1.OWNERSHIP_KEY, context.getHandler());
        for (const action of permissions) {
            const ctx = {
                userId: user.id,
                roleId: user.roleId,
                roleName: user.role || user.roleName,
                roleLevel: user.roleLevel ?? 5,
                departmentId: user.departmentId,
                departmentPath: user.departmentPath,
                action,
                resourceType: ownershipMeta?.resourceType || request.params?.entityType,
                resourceId: request.params?.[ownershipMeta?.paramName || 'id'],
                attributes: request.body,
            };
            const result = await this.permissionChain.can(ctx);
            if (result.allowed) {
                if (result.makerChecker?.requiresApproval) {
                    request.makerChecker = result.makerChecker;
                }
                return true;
            }
            this.logger.debug(`Denied: ${result.reason} for ${action}`);
        }
        throw new permission_error_1.PermissionError('PERMISSION_DENIED', permissions[0]);
    }
};
exports.PermissionPolicyGuard = PermissionPolicyGuard;
exports.PermissionPolicyGuard = PermissionPolicyGuard = PermissionPolicyGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        permission_chain_service_1.PermissionChainService])
], PermissionPolicyGuard);
//# sourceMappingURL=permission-policy.guard.js.map