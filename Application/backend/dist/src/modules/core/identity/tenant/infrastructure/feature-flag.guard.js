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
exports.FeatureFlagGuard = exports.REQUIRE_FEATURE_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const limit_checker_service_1 = require("../services/limit-checker.service");
exports.REQUIRE_FEATURE_KEY = 'requireFeature';
let FeatureFlagGuard = class FeatureFlagGuard {
    constructor(reflector, limiter) {
        this.reflector = reflector;
        this.limiter = limiter;
    }
    async canActivate(context) {
        const feature = this.reflector.get(exports.REQUIRE_FEATURE_KEY, context.getHandler());
        if (!feature)
            return true;
        const request = context.switchToHttp().getRequest();
        const tenantId = request.user?.tenantId;
        if (!tenantId)
            return true;
        const hasIt = await this.limiter.hasFeature(tenantId, feature);
        if (!hasIt) {
            throw new common_1.ForbiddenException(`Feature not available in your plan: ${feature}`);
        }
        return true;
    }
};
exports.FeatureFlagGuard = FeatureFlagGuard;
exports.FeatureFlagGuard = FeatureFlagGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        limit_checker_service_1.LimitCheckerService])
], FeatureFlagGuard);
//# sourceMappingURL=feature-flag.guard.js.map