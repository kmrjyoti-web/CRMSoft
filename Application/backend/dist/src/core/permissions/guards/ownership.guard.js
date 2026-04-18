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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnershipGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const ownership_engine_1 = require("../engines/ownership.engine");
const require_ownership_decorator_1 = require("../decorators/require-ownership.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const permission_error_1 = require("../types/permission-error");
let OwnershipGuard = class OwnershipGuard {
    constructor(reflector, ownershipEngine) {
        this.reflector = reflector;
        this.ownershipEngine = ownershipEngine;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(roles_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(), context.getClass(),
        ]);
        if (isPublic)
            return true;
        const meta = this.reflector.get(require_ownership_decorator_1.OWNERSHIP_KEY, context.getHandler());
        if (!meta)
            return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user)
            throw new permission_error_1.PermissionError('AUTH_REQUIRED', 'ownership:check');
        const resourceId = request.params[meta.paramName];
        if (!resourceId)
            return true;
        const methodMap = {
            GET: 'read', POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete',
        };
        const actionSuffix = methodMap[request.method] || 'read';
        const ctx = {
            userId: user.id,
            roleId: user.roleId,
            roleName: user.role || user.roleName,
            roleLevel: user.roleLevel ?? 5,
            action: `${meta.resourceType}s:${actionSuffix}`,
            resourceType: meta.resourceType,
            resourceId,
        };
        const allowed = await this.ownershipEngine.check(ctx);
        if (!allowed) {
            throw new permission_error_1.PermissionError('OWNERSHIP_DENIED', ctx.action, 'OWNERSHIP');
        }
        return true;
    }
};
exports.OwnershipGuard = OwnershipGuard;
exports.OwnershipGuard = OwnershipGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        ownership_engine_1.OwnershipEngine])
], OwnershipGuard);
//# sourceMappingURL=ownership.guard.js.map