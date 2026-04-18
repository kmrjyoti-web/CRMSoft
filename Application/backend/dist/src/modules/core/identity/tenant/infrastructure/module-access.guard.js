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
exports.ModuleAccessGuard = exports.REQUIRE_MODULE_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const module_access_service_1 = require("../services/module-access.service");
exports.REQUIRE_MODULE_KEY = 'requiredModule';
let ModuleAccessGuard = class ModuleAccessGuard {
    constructor(reflector, moduleAccessService) {
        this.reflector = reflector;
        this.moduleAccessService = moduleAccessService;
    }
    async canActivate(context) {
        const moduleCode = this.reflector.get(exports.REQUIRE_MODULE_KEY, context.getHandler());
        if (!moduleCode)
            return true;
        const request = context.switchToHttp().getRequest();
        const tenantId = request.tenantId || request.user?.tenantId;
        if (!tenantId)
            return true;
        const result = await this.moduleAccessService.checkAccess(tenantId, moduleCode);
        if (!result.allowed) {
            throw new common_1.ForbiddenException(`Module '${moduleCode}' is not available in your current plan`);
        }
        request.moduleAccessLevel = result.accessLevel;
        return true;
    }
};
exports.ModuleAccessGuard = ModuleAccessGuard;
exports.ModuleAccessGuard = ModuleAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        module_access_service_1.ModuleAccessService])
], ModuleAccessGuard);
//# sourceMappingURL=module-access.guard.js.map