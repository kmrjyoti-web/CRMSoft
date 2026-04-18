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
exports.WhatsAppWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../../../common/decorators/roles.decorator");
const wa_webhook_service_1 = require("../services/wa-webhook.service");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let WhatsAppWebhookController = class WhatsAppWebhookController {
    constructor(webhookService, prisma) {
        this.webhookService = webhookService;
        this.prisma = prisma;
    }
    async verifyWebhook(mode, token, challenge) {
        const waba = await this.prisma.working.whatsAppBusinessAccount.findFirst({
            where: { webhookVerifyToken: token },
        });
        if (!waba)
            return 'Invalid token';
        const result = this.webhookService.verifyWebhook(mode, token, challenge, waba.webhookVerifyToken);
        return result || 'Verification failed';
    }
    async receiveWebhook(body) {
        await this.webhookService.processWebhook(body);
        return 'EVENT_RECEIVED';
    }
};
exports.WhatsAppWebhookController = WhatsAppWebhookController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WhatsAppWebhookController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Public)(),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppWebhookController.prototype, "receiveWebhook", null);
exports.WhatsAppWebhookController = WhatsAppWebhookController = __decorate([
    (0, swagger_1.ApiTags)('WhatsApp Webhook'),
    (0, common_1.Controller)('whatsapp/webhook'),
    __metadata("design:paramtypes", [wa_webhook_service_1.WaWebhookService,
        prisma_service_1.PrismaService])
], WhatsAppWebhookController);
//# sourceMappingURL=whatsapp-webhook.controller.js.map