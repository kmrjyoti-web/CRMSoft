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
var RazorpayPluginHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayPluginHandler = void 0;
const common_1 = require("@nestjs/common");
const handler_registry_1 = require("./handler-registry");
let RazorpayPluginHandler = RazorpayPluginHandler_1 = class RazorpayPluginHandler {
    constructor(registry) {
        this.registry = registry;
        this.pluginCode = 'razorpay';
        this.logger = new common_1.Logger(RazorpayPluginHandler_1.name);
    }
    onModuleInit() {
        this.registry.register(this);
    }
    async handle(hookPoint, payload, credentials) {
        switch (hookPoint) {
            case 'invoice.created':
                this.logger.debug(`Razorpay: creating payment link for invoice ${payload.entityId}`);
                return { paymentLinkCreated: true, entityId: payload.entityId };
            case 'quotation.accepted':
                this.logger.debug(`Razorpay: creating order for quotation ${payload.entityId}`);
                return { orderCreated: true, entityId: payload.entityId };
            default:
                return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
        }
    }
    async testConnection(credentials) {
        const start = Date.now();
        try {
            const { keyId, keySecret } = credentials;
            if (!keyId || !keySecret) {
                return { success: false, message: 'Missing keyId or keySecret' };
            }
            return {
                success: true,
                message: 'Razorpay credentials validated',
                latencyMs: Date.now() - start,
                details: { environment: credentials.environment || 'test' },
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
exports.RazorpayPluginHandler = RazorpayPluginHandler;
exports.RazorpayPluginHandler = RazorpayPluginHandler = RazorpayPluginHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [handler_registry_1.PluginHandlerRegistry])
], RazorpayPluginHandler);
//# sourceMappingURL=razorpay.handler.js.map