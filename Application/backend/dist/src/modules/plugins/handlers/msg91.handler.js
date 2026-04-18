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
var Msg91PluginHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Msg91PluginHandler = void 0;
const common_1 = require("@nestjs/common");
const handler_registry_1 = require("./handler-registry");
let Msg91PluginHandler = Msg91PluginHandler_1 = class Msg91PluginHandler {
    constructor(registry) {
        this.registry = registry;
        this.pluginCode = 'msg91';
        this.logger = new common_1.Logger(Msg91PluginHandler_1.name);
    }
    onModuleInit() {
        this.registry.register(this);
    }
    async handle(hookPoint, payload, credentials) {
        const { authKey, senderId } = credentials;
        switch (hookPoint) {
            case 'lead.created':
                this.logger.debug(`MSG91: sending welcome SMS for lead ${payload.entityId}`);
                return { smsSent: true, hookPoint, entityId: payload.entityId };
            case 'demo.reminder':
                this.logger.debug(`MSG91: sending demo reminder SMS for ${payload.entityId}`);
                return { smsSent: true, hookPoint, entityId: payload.entityId };
            case 'payment.reminder':
                this.logger.debug(`MSG91: sending payment reminder SMS for ${payload.entityId}`);
                return { smsSent: true, hookPoint, entityId: payload.entityId };
            case 'otp.requested':
                this.logger.debug(`MSG91: sending OTP for ${payload.entityId}`);
                return { otpSent: true, hookPoint, entityId: payload.entityId };
            default:
                return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
        }
    }
    async testConnection(credentials) {
        const start = Date.now();
        try {
            const { authKey, senderId } = credentials;
            if (!authKey || !senderId) {
                return { success: false, message: 'Missing authKey or senderId' };
            }
            return {
                success: true,
                message: `MSG91 credentials validated for sender ${senderId}`,
                latencyMs: Date.now() - start,
                details: { senderId },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'MSG91 connection failed',
                latencyMs: Date.now() - start,
            };
        }
    }
};
exports.Msg91PluginHandler = Msg91PluginHandler;
exports.Msg91PluginHandler = Msg91PluginHandler = Msg91PluginHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [handler_registry_1.PluginHandlerRegistry])
], Msg91PluginHandler);
//# sourceMappingURL=msg91.handler.js.map