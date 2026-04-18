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
var MenuPermissionGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuPermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const require_menu_permission_decorator_1 = require("../decorators/require-menu-permission.decorator");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const menu_permission_service_1 = require("../../../modules/core/identity/menus/application/services/menu-permission.service");
let MenuPermissionGuard = MenuPermissionGuard_1 = class MenuPermissionGuard {
    constructor(reflector, menuPermissionService) {
        this.reflector = reflector;
        this.menuPermissionService = menuPermissionService;
        this.logger = new common_1.Logger(MenuPermissionGuard_1.name);
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(roles_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(), context.getClass(),
        ]);
        if (isPublic)
            return true;
        const meta = this.reflector.getAllAndOverride(require_menu_permission_decorator_1.MENU_PERMISSION_KEY, [
            context.getHandler(), context.getClass(),
        ]);
        if (!meta)
            return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        if (user.isSuperAdmin)
            return true;
        const tenantId = user.tenantId;
        const roleId = user.roleId;
        const roleName = user.role || user.roleName;
        if (!tenantId || !roleId) {
            throw new common_1.ForbiddenException('Tenant or role not found');
        }
        const { menuCode, action, actions, requireAll } = meta;
        let allowed;
        if (actions && actions.length > 0) {
            if (requireAll) {
                allowed = await this.menuPermissionService.hasAllPermissions(tenantId, roleId, menuCode, actions, roleName);
            }
            else {
                allowed = await this.menuPermissionService.hasAnyPermission(tenantId, roleId, menuCode, actions, roleName);
            }
        }
        else {
            allowed = await this.menuPermissionService.hasPermission(tenantId, roleId, menuCode, action, roleName);
        }
        if (!allowed) {
            const actionLabel = actions?.join(', ') || action;
            this.logger.warn(`Permission denied: User ${user.id} (role: ${roleName}) attempted ${actionLabel} on ${menuCode}`);
            throw new common_1.ForbiddenException({
                errorCode: 'MENU_PERMISSION_DENIED',
                message: `You do not have permission to ${actionLabel} on ${menuCode}`,
                messageHi: `आपको ${menuCode} पर ${actionLabel} करने की अनुमति नहीं है`,
                menuCode,
                action: actionLabel,
            });
        }
        return true;
    }
};
exports.MenuPermissionGuard = MenuPermissionGuard;
exports.MenuPermissionGuard = MenuPermissionGuard = MenuPermissionGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        menu_permission_service_1.MenuPermissionService])
], MenuPermissionGuard);
//# sourceMappingURL=menu-permission.guard.js.map