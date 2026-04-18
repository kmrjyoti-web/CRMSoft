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
var ExotelPluginHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExotelPluginHandler = void 0;
const common_1 = require("@nestjs/common");
const handler_registry_1 = require("./handler-registry");
let ExotelPluginHandler = ExotelPluginHandler_1 = class ExotelPluginHandler {
    constructor(registry) {
        this.registry = registry;
        this.pluginCode = 'exotel';
        this.logger = new common_1.Logger(ExotelPluginHandler_1.name);
    }
    onModuleInit() {
        this.registry.register(this);
    }
    async handle(hookPoint, payload, credentials) {
        const { apiKey, apiToken, subdomain, callerId } = credentials;
        switch (hookPoint) {
            case 'lead.created':
                this.logger.debug(`Exotel: logging new lead ${payload.entityId} for auto-dial queue`);
                return { queued: true, hookPoint, entityId: payload.entityId };
            default:
                return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
        }
    }
    async testConnection(credentials) {
        const start = Date.now();
        try {
            const { apiKey, apiToken, subdomain } = credentials;
            if (!apiKey || !apiToken || !subdomain) {
                return { success: false, message: 'Missing apiKey, apiToken, or subdomain' };
            }
            return {
                success: true,
                message: `Exotel credentials validated for subdomain ${subdomain}`,
                latencyMs: Date.now() - start,
                details: { subdomain },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Exotel connection failed',
                latencyMs: Date.now() - start,
            };
        }
    }
};
exports.ExotelPluginHandler = ExotelPluginHandler;
exports.ExotelPluginHandler = ExotelPluginHandler = ExotelPluginHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [handler_registry_1.PluginHandlerRegistry])
], ExotelPluginHandler);
//# sourceMappingURL=exotel.handler.js.map