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
var ApiKeyGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const api_key_service_1 = require("../services/api-key.service");
const app_error_1 = require("../../../../common/errors/app-error");
const api_public_decorator_1 = require("../decorators/api-public.decorator");
let ApiKeyGuard = ApiKeyGuard_1 = class ApiKeyGuard {
    constructor(reflector, apiKeyService) {
        this.reflector = reflector;
        this.apiKeyService = apiKeyService;
        this.logger = new common_1.Logger(ApiKeyGuard_1.name);
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(api_public_decorator_1.API_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['x-api-key'] || request.headers['authorization'];
        if (!authHeader) {
            throw app_error_1.AppError.from('AUTH_TOKEN_MISSING').withDetails({
                hint: 'Provide API key via X-Api-Key header or Authorization: Bearer <key>',
            });
        }
        const rawKey = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
        const result = await this.apiKeyService.validate(rawKey);
        if (!result) {
            throw app_error_1.AppError.from('AUTH_TOKEN_INVALID');
        }
        const { apiKey, tenantId } = result;
        const clientIp = request.ip || request.connection?.remoteAddress || '0.0.0.0';
        if (!this.apiKeyService.isIpAllowed(apiKey, clientIp)) {
            throw app_error_1.AppError.from('API_KEY_IP_BLOCKED').withDetails({ ip: clientIp });
        }
        request.apiKey = apiKey;
        request.tenantId = tenantId;
        request.apiKeyId = apiKey.id;
        request.apiKeyName = apiKey.name;
        request.apiKeyScopes = apiKey.scopes;
        return true;
    }
};
exports.ApiKeyGuard = ApiKeyGuard;
exports.ApiKeyGuard = ApiKeyGuard = ApiKeyGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        api_key_service_1.ApiKeyService])
], ApiKeyGuard);
//# sourceMappingURL=api-key.guard.js.map