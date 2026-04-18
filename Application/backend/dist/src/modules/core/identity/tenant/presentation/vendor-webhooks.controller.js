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
exports.VendorWebhooksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../common/guards/jwt-auth.guard");
const vendor_guard_1 = require("../infrastructure/vendor.guard");
const api_response_1 = require("../../../../../common/utils/api-response");
let VendorWebhooksController = class VendorWebhooksController {
    async list(page = 1, limit = 20) {
        return api_response_1.ApiResponse.paginated([], 0, +page, +limit);
    }
    async listDeliveries(webhookId) {
        return api_response_1.ApiResponse.success([]);
    }
    async testWebhook(webhookId) {
        return api_response_1.ApiResponse.success({ delivered: true });
    }
    async retryDelivery(deliveryId) {
        return api_response_1.ApiResponse.success({ retried: true });
    }
};
exports.VendorWebhooksController = VendorWebhooksController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List webhooks (stub)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VendorWebhooksController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':webhookId/deliveries'),
    (0, swagger_1.ApiOperation)({ summary: 'List deliveries for a webhook (stub)' }),
    __param(0, (0, common_1.Param)('webhookId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorWebhooksController.prototype, "listDeliveries", null);
__decorate([
    (0, common_1.Post)(':webhookId/test'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a test webhook delivery (stub)' }),
    __param(0, (0, common_1.Param)('webhookId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorWebhooksController.prototype, "testWebhook", null);
__decorate([
    (0, common_1.Post)('deliveries/:deliveryId/retry'),
    (0, swagger_1.ApiOperation)({ summary: 'Retry a failed webhook delivery (stub)' }),
    __param(0, (0, common_1.Param)('deliveryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorWebhooksController.prototype, "retryDelivery", null);
exports.VendorWebhooksController = VendorWebhooksController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Webhooks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_guard_1.VendorGuard),
    (0, common_1.Controller)('vendor/webhooks')
], VendorWebhooksController);
//# sourceMappingURL=vendor-webhooks.controller.js.map