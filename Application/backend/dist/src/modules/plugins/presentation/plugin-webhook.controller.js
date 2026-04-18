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
var PluginWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginWebhookController = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const plugin_hook_service_1 = require("../services/plugin-hook.service");
const plugin_service_1 = require("../services/plugin.service");
const encryption_service_1 = require("../../softwarevendor/tenant-config/services/encryption.service");
let PluginWebhookController = PluginWebhookController_1 = class PluginWebhookController {
    constructor(prisma, hookService, pluginService, encryption) {
        this.prisma = prisma;
        this.hookService = hookService;
        this.pluginService = pluginService;
        this.encryption = encryption;
        this.logger = new common_1.Logger(PluginWebhookController_1.name);
    }
    async verifyWebhook(pluginCode, tenantId, mode, verifyToken, challenge, res) {
        if (mode !== 'subscribe' || !verifyToken) {
            return res.status(403).send('Forbidden');
        }
        try {
            const credentials = await this.pluginService.getDecryptedCredentials(tenantId, pluginCode);
            if (credentials?.webhookVerifyToken === verifyToken) {
                this.logger.log(`Webhook verified for ${pluginCode}/${tenantId}`);
                return res.status(200).send(challenge);
            }
        }
        catch {
        }
        return res.status(403).send('Verification failed');
    }
    async handleWebhook(pluginCode, tenantId, req) {
        this.logger.debug(`Webhook received: ${pluginCode}/${tenantId}`);
        const isEnabled = await this.pluginService.isPluginEnabled(tenantId, pluginCode);
        if (!isEnabled) {
            throw new common_1.BadRequestException(`Plugin "${pluginCode}" is not enabled`);
        }
        const plugin = await this.prisma.platform.pluginRegistry.findUnique({
            where: { code: pluginCode },
        });
        if (!plugin?.webhookConfig) {
            throw new common_1.BadRequestException(`Plugin "${pluginCode}" does not support webhooks`);
        }
        const webhookConfig = plugin.webhookConfig;
        if (webhookConfig.verificationMethod === 'signature') {
            await this.verifySignature(pluginCode, tenantId, webhookConfig, req);
        }
        const body = req.body;
        const eventType = this.extractEventType(pluginCode, body);
        this.hookService
            .fireHook(`webhook.${pluginCode}.${eventType}`, {
            tenantId,
            entityType: pluginCode,
            entityId: body?.id || body?.entity?.id || 'unknown',
            action: eventType,
            data: body,
        })
            .catch((err) => this.logger.error(`Webhook hook failed: ${err.message}`));
        return { received: true, event: eventType };
    }
    async verifySignature(pluginCode, tenantId, webhookConfig, req) {
        const signatureHeader = webhookConfig.signatureHeader;
        const signature = req.headers[signatureHeader?.toLowerCase()];
        if (!signature) {
            throw new common_1.BadRequestException(`Missing signature header: ${signatureHeader}`);
        }
        const credentials = await this.pluginService.getDecryptedCredentials(tenantId, pluginCode);
        const secret = credentials?.webhookSecret;
        if (!secret) {
            throw new common_1.BadRequestException('Webhook secret not configured');
        }
        const rawBody = typeof req.body === 'string'
            ? req.body
            : JSON.stringify(req.body);
        let isValid = false;
        if (pluginCode === 'razorpay') {
            const expected = crypto
                .createHmac('sha256', secret)
                .update(rawBody)
                .digest('hex');
            isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
        }
        else if (pluginCode === 'stripe') {
            const parts = signature.split(',');
            const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2);
            const sig = parts.find((p) => p.startsWith('v1='))?.slice(3);
            if (timestamp && sig) {
                const payload = `${timestamp}.${rawBody}`;
                const expected = crypto
                    .createHmac('sha256', secret)
                    .update(payload)
                    .digest('hex');
                isValid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
            }
        }
        else {
            const expected = crypto
                .createHmac('sha256', secret)
                .update(rawBody)
                .digest('hex');
            isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
        }
        if (!isValid) {
            this.logger.warn(`Invalid webhook signature for ${pluginCode}/${tenantId}`);
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
    }
    extractEventType(pluginCode, body) {
        switch (pluginCode) {
            case 'razorpay':
                return body?.event || 'unknown';
            case 'stripe':
                return body?.type || 'unknown';
            case 'whatsapp_cloud':
                return body?.entry?.[0]?.changes?.[0]?.field || 'messages';
            case 'exotel':
                return body?.EventType || body?.Status || 'call';
            default:
                return body?.event || body?.type || 'webhook';
        }
    }
};
exports.PluginWebhookController = PluginWebhookController;
__decorate([
    (0, common_1.Get)(':pluginCode/:tenantId'),
    __param(0, (0, common_1.Param)('pluginCode')),
    __param(1, (0, common_1.Param)('tenantId')),
    __param(2, (0, common_1.Query)('hub.mode')),
    __param(3, (0, common_1.Query)('hub.verify_token')),
    __param(4, (0, common_1.Query)('hub.challenge')),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PluginWebhookController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)(':pluginCode/:tenantId'),
    __param(0, (0, common_1.Param)('pluginCode')),
    __param(1, (0, common_1.Param)('tenantId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PluginWebhookController.prototype, "handleWebhook", null);
exports.PluginWebhookController = PluginWebhookController = PluginWebhookController_1 = __decorate([
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        plugin_hook_service_1.PluginHookService,
        plugin_service_1.PluginService,
        encryption_service_1.EncryptionService])
], PluginWebhookController);
//# sourceMappingURL=plugin-webhook.controller.js.map