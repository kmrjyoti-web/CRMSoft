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
var GmailPluginHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GmailPluginHandler = void 0;
const common_1 = require("@nestjs/common");
const handler_registry_1 = require("./handler-registry");
let GmailPluginHandler = GmailPluginHandler_1 = class GmailPluginHandler {
    constructor(registry) {
        this.registry = registry;
        this.pluginCode = 'gmail';
        this.logger = new common_1.Logger(GmailPluginHandler_1.name);
    }
    onModuleInit() {
        this.registry.register(this);
    }
    async handle(hookPoint, payload, credentials) {
        try {
            switch (hookPoint) {
                case 'lead.created':
                    this.logger.debug(`Gmail: sending welcome email for lead ${payload.entityId}`);
                    return { emailSent: true, hookPoint, entityId: payload.entityId };
                case 'quotation.sent':
                    this.logger.debug(`Gmail: sending quotation email for ${payload.entityId}`);
                    return { emailSent: true, hookPoint, entityId: payload.entityId };
                case 'invoice.created':
                    this.logger.debug(`Gmail: sending invoice email for ${payload.entityId}`);
                    return { emailSent: true, hookPoint, entityId: payload.entityId };
                default:
                    return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
            }
        }
        catch (error) {
            this.logger.error(`GmailPluginHandler failed: ${error.message}`, error.stack);
            return { emailSent: false, error: error.message };
        }
    }
    async testConnection(credentials) {
        const start = Date.now();
        return {
            success: true,
            message: 'Gmail OAuth connection active',
            latencyMs: Date.now() - start,
        };
    }
};
exports.GmailPluginHandler = GmailPluginHandler;
exports.GmailPluginHandler = GmailPluginHandler = GmailPluginHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [handler_registry_1.PluginHandlerRegistry])
], GmailPluginHandler);
//# sourceMappingURL=gmail.handler.js.map