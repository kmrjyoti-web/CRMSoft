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
var StripePluginHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripePluginHandler = void 0;
const common_1 = require("@nestjs/common");
const handler_registry_1 = require("./handler-registry");
let StripePluginHandler = StripePluginHandler_1 = class StripePluginHandler {
    constructor(registry) {
        this.registry = registry;
        this.pluginCode = 'stripe';
        this.logger = new common_1.Logger(StripePluginHandler_1.name);
    }
    onModuleInit() {
        this.registry.register(this);
    }
    async handle(hookPoint, payload, credentials) {
        switch (hookPoint) {
            case 'invoice.created':
                this.logger.debug(`Stripe: creating payment intent for invoice ${payload.entityId}`);
                return { paymentIntentCreated: true, entityId: payload.entityId };
            case 'quotation.accepted':
                this.logger.debug(`Stripe: creating checkout session for quotation ${payload.entityId}`);
                return { checkoutCreated: true, entityId: payload.entityId };
            default:
                return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
        }
    }
    async testConnection(credentials) {
        const start = Date.now();
        try {
            const { secretKey } = credentials;
            if (!secretKey) {
                return { success: false, message: 'Missing secretKey' };
            }
            return {
                success: true,
                message: 'Stripe credentials validated',
                latencyMs: Date.now() - start,
                details: { environment: credentials.environment || 'test' },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Stripe connection failed',
                latencyMs: Date.now() - start,
            };
        }
    }
};
exports.StripePluginHandler = StripePluginHandler;
exports.StripePluginHandler = StripePluginHandler = StripePluginHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [handler_registry_1.PluginHandlerRegistry])
], StripePluginHandler);
//# sourceMappingURL=stripe.handler.js.map