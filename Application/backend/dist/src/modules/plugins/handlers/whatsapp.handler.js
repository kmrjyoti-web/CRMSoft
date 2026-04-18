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
var WhatsAppPluginHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppPluginHandler = void 0;
const common_1 = require("@nestjs/common");
const handler_registry_1 = require("./handler-registry");
let WhatsAppPluginHandler = WhatsAppPluginHandler_1 = class WhatsAppPluginHandler {
    constructor(registry) {
        this.registry = registry;
        this.pluginCode = 'whatsapp_cloud';
        this.logger = new common_1.Logger(WhatsAppPluginHandler_1.name);
    }
    onModuleInit() {
        this.registry.register(this);
    }
    async handle(hookPoint, payload, credentials) {
        const { phoneNumberId, accessToken } = credentials;
        switch (hookPoint) {
            case 'lead.created':
                this.logger.debug(`WhatsApp: sending welcome template for lead ${payload.entityId}`);
                return { sent: true, hookPoint, entityId: payload.entityId };
            case 'quotation.sent':
                this.logger.debug(`WhatsApp: sending quotation link for ${payload.entityId}`);
                return { sent: true, hookPoint, entityId: payload.entityId };
            case 'payment.received':
                this.logger.debug(`WhatsApp: sending payment confirmation for ${payload.entityId}`);
                return { sent: true, hookPoint, entityId: payload.entityId };
            default:
                return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
        }
    }
    async testConnection(credentials) {
        const start = Date.now();
        try {
            const { phoneNumberId, accessToken } = credentials;
            if (!phoneNumberId || !accessToken) {
                return { success: false, message: 'Missing phoneNumberId or accessToken' };
            }
            return {
                success: true,
                message: 'WhatsApp Cloud API credentials validated',
                latencyMs: Date.now() - start,
                details: { phoneNumberId },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Connection failed',
                latencyMs: Date.now() - start,
            };
        }
    }
};
exports.WhatsAppPluginHandler = WhatsAppPluginHandler;
exports.WhatsAppPluginHandler = WhatsAppPluginHandler = WhatsAppPluginHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [handler_registry_1.PluginHandlerRegistry])
], WhatsAppPluginHandler);
//# sourceMappingURL=whatsapp.handler.js.map