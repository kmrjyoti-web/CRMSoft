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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorAiTokensController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const api_response_1 = require("../../../../../common/utils/api-response");
let VendorAiTokensController = class VendorAiTokensController {
    async getUsage() {
        return api_response_1.ApiResponse.success({
            totalTokens: 0,
            usedTokens: 0,
            remainingTokens: 0,
        });
    }
    async listTenantUsage(page = 1, limit = 20) {
        return api_response_1.ApiResponse.paginated([], 0, +page, +limit);
    }
    async getSettings() {
        return api_response_1.ApiResponse.success({
            enabled: false,
            maxTokensPerTenant: 10000,
            defaultModel: 'claude-sonnet-4-6',
        });
    }
    async updateSettings(body) {
        return api_response_1.ApiResponse.success(body, 'AI token settings updated');
    }
};
exports.VendorAiTokensController = VendorAiTokensController;
__decorate([
    (0, common_1.Get)('usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI token usage summary (stub)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VendorAiTokensController.prototype, "getUsage", null);
__decorate([
    (0, common_1.Get)('tenants'),
    (0, swagger_1.ApiOperation)({ summary: 'List AI token usage per tenant (stub)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VendorAiTokensController.prototype, "listTenantUsage", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI token settings (stub)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VendorAiTokensController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update AI token settings (stub)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorAiTokensController.prototype, "updateSettings", null);
exports.VendorAiTokensController = VendorAiTokensController = __decorate([
    (0, swagger_1.ApiTags)('Vendor AI Tokens'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor/ai-tokens')
], VendorAiTokensController);
//# sourceMappingURL=vendor-ai-tokens.controller.js.map