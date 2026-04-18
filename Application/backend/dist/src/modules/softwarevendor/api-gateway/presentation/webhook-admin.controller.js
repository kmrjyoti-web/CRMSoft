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
exports.WebhookAdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const webhook_service_1 = require("../services/webhook.service");
const webhook_dispatcher_service_1 = require("../services/webhook-dispatcher.service");
const webhook_dto_1 = require("./dto/webhook.dto");
let WebhookAdminController = class WebhookAdminController {
    constructor(webhookService, dispatcher) {
        this.webhookService = webhookService;
        this.dispatcher = dispatcher;
    }
    async create(req, dto) {
        return this.webhookService.create(req.user.tenantId, dto, req.user.id, `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim());
    }
    async list(req) {
        return this.webhookService.listByTenant(req.user.tenantId);
    }
    getAvailableEvents() {
        return this.webhookService.getAvailableEvents();
    }
    async getById(req, id) {
        return this.webhookService.getById(req.user.tenantId, id);
    }
    async update(req, id, dto) {
        return this.webhookService.update(req.user.tenantId, id, dto);
    }
    async delete(req, id) {
        await this.webhookService.delete(req.user.tenantId, id);
        return { message: 'Webhook endpoint deleted' };
    }
    async getDeliveries(req, id, page, limit) {
        return this.dispatcher.getDeliveries(req.user.tenantId, id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
    async testWebhook(req, id) {
        await this.dispatcher.dispatch(req.user.tenantId, 'webhook.test', id, {
            message: 'This is a test webhook delivery',
            timestamp: new Date().toISOString(),
        });
        return { message: 'Test webhook dispatched' };
    }
};
exports.WebhookAdminController = WebhookAdminController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, webhook_dto_1.CreateWebhookDto]),
    __metadata("design:returntype", Promise)
], WebhookAdminController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhookAdminController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('events'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WebhookAdminController.prototype, "getAvailableEvents", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhookAdminController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, webhook_dto_1.UpdateWebhookDto]),
    __metadata("design:returntype", Promise)
], WebhookAdminController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhookAdminController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/deliveries'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], WebhookAdminController.prototype, "getDeliveries", null);
__decorate([
    (0, common_1.Post)(':id/test'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhookAdminController.prototype, "testWebhook", null);
exports.WebhookAdminController = WebhookAdminController = __decorate([
    (0, common_1.Controller)('api-gateway/admin/webhooks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [webhook_service_1.WebhookService,
        webhook_dispatcher_service_1.WebhookDispatcherService])
], WebhookAdminController);
//# sourceMappingURL=webhook-admin.controller.js.map