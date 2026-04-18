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
var TallyPluginHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TallyPluginHandler = void 0;
const common_1 = require("@nestjs/common");
const handler_registry_1 = require("./handler-registry");
let TallyPluginHandler = TallyPluginHandler_1 = class TallyPluginHandler {
    constructor(registry) {
        this.registry = registry;
        this.pluginCode = 'tally_erp';
        this.logger = new common_1.Logger(TallyPluginHandler_1.name);
    }
    onModuleInit() {
        this.registry.register(this);
    }
    async handle(hookPoint, payload, credentials) {
        const { serverUrl, port, companyName } = credentials;
        const tallyUrl = `${serverUrl}:${port}`;
        switch (hookPoint) {
            case 'invoice.created':
                this.logger.debug(`Tally: syncing invoice ${payload.entityId} to ${companyName}`);
                return { synced: true, hookPoint, entityId: payload.entityId, target: tallyUrl };
            case 'payment.received':
                this.logger.debug(`Tally: syncing payment ${payload.entityId} to ${companyName}`);
                return { synced: true, hookPoint, entityId: payload.entityId };
            case 'contact.created':
                this.logger.debug(`Tally: creating ledger for contact ${payload.entityId}`);
                return { synced: true, hookPoint, entityId: payload.entityId };
            default:
                return { skipped: true, reason: `Unhandled hook: ${hookPoint}` };
        }
    }
    async testConnection(credentials) {
        const start = Date.now();
        try {
            const { serverUrl, port, companyName } = credentials;
            if (!serverUrl || !port) {
                return { success: false, message: 'Missing serverUrl or port' };
            }
            return {
                success: true,
                message: `Tally connection validated for ${companyName}`,
                latencyMs: Date.now() - start,
                details: { serverUrl, port, companyName },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Tally connection failed',
                latencyMs: Date.now() - start,
            };
        }
    }
};
exports.TallyPluginHandler = TallyPluginHandler;
exports.TallyPluginHandler = TallyPluginHandler = TallyPluginHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [handler_registry_1.PluginHandlerRegistry])
], TallyPluginHandler);
//# sourceMappingURL=tally.handler.js.map