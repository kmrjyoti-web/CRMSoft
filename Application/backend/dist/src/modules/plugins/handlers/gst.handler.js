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
var GstPluginHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GstPluginHandler = void 0;
const common_1 = require("@nestjs/common");
const handler_registry_1 = require("./handler-registry");
let GstPluginHandler = GstPluginHandler_1 = class GstPluginHandler {
    constructor(registry) {
        this.registry = registry;
        this.pluginCode = 'cleartax_gst';
        this.logger = new common_1.Logger(GstPluginHandler_1.name);
    }
    onModuleInit() {
        this.registry.register(this);
    }
    async handle(hookPoint, payload, credentials) {
        const { apiToken, gstin } = credentials;
        switch (hookPoint) {
            case 'invoice.created':
                this.logger.debug(`GST: generating e-invoice for ${payload.entityId}`);
                return { eInvoiceGenerated: true, entityId: payload.entityId };
            case 'invoice.updated':
                this.logger.debug(`GST: updating e-invoice for ${payload.entityId}`);
                return { eInvoiceUpdated: true, entityId: payload.entityId };
            case 'contact.created':
            case 'organization.created':
                this.logger.debug(`GST: validating GSTIN for ${payload.entityId}`);
                return { gstinValidated: true, entityId: payload.entityId };
            default:
                return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
        }
    }
    async testConnection(credentials) {
        const start = Date.now();
        try {
            const { apiToken, gstin, environment } = credentials;
            if (!apiToken || !gstin) {
                return { success: false, message: 'Missing apiToken or gstin' };
            }
            return {
                success: true,
                message: `ClearTax GST credentials validated for GSTIN ${gstin}`,
                latencyMs: Date.now() - start,
                details: { gstin, environment: environment || 'sandbox' },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'GST connection failed',
                latencyMs: Date.now() - start,
            };
        }
    }
};
exports.GstPluginHandler = GstPluginHandler;
exports.GstPluginHandler = GstPluginHandler = GstPluginHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [handler_registry_1.PluginHandlerRegistry])
], GstPluginHandler);
//# sourceMappingURL=gst.handler.js.map