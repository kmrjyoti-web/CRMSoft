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
exports.ApiScopeGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const scope_checker_service_1 = require("../services/scope-checker.service");
const app_error_1 = require("../../../../common/errors/app-error");
const api_scopes_decorator_1 = require("../decorators/api-scopes.decorator");
let ApiScopeGuard = class ApiScopeGuard {
    constructor(reflector, scopeChecker) {
        this.reflector = reflector;
        this.scopeChecker = scopeChecker;
    }
    canActivate(context) {
        const requiredScopes = this.reflector.getAllAndOverride(api_scopes_decorator_1.API_SCOPES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredScopes || requiredScopes.length === 0)
            return true;
        const request = context.switchToHttp().getRequest();
        const keyScopes = request.apiKeyScopes || [];
        if (!this.scopeChecker.hasScopes(keyScopes, requiredScopes)) {
            const missing = this.scopeChecker.getMissingScopes(keyScopes, requiredScopes);
            throw app_error_1.AppError.from('API_SCOPE_INSUFFICIENT').withDetails({
                required: requiredScopes,
                missing,
                granted: keyScopes,
            });
        }
        return true;
    }
};
exports.ApiScopeGuard = ApiScopeGuard;
exports.ApiScopeGuard = ApiScopeGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        scope_checker_service_1.ScopeCheckerService])
], ApiScopeGuard);
//# sourceMappingURL=api-scope.guard.js.map