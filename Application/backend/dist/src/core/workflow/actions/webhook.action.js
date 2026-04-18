"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebhookAction_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookAction = void 0;
const common_1 = require("@nestjs/common");
let WebhookAction = WebhookAction_1 = class WebhookAction {
    constructor() {
        this.type = 'WEBHOOK';
        this.logger = new common_1.Logger(WebhookAction_1.name);
    }
    async execute(config, context) {
        const { url, method, headers, body } = config;
        if (!url) {
            return { status: 'FAILED', errorMessage: 'Missing "url" in webhook config' };
        }
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(url, {
                method: method || 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(headers || {}),
                },
                body: body ? JSON.stringify(body) : JSON.stringify({
                    event: 'workflow_transition',
                    entityType: context.entityType,
                    entityId: context.entityId,
                    state: context.currentState.code,
                    performedBy: context.performer.id,
                    timestamp: context.timestamp.toISOString(),
                }),
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (!response.ok) {
                const text = await response.text().catch(() => 'No body');
                this.logger.warn(`Webhook ${url} returned ${response.status}: ${text}`);
                return { status: 'FAILED', errorMessage: `HTTP ${response.status}: ${text}` };
            }
            const responseData = await response.json().catch(() => ({}));
            this.logger.log(`Webhook ${url} succeeded with ${response.status}`);
            return { status: 'SUCCESS', result: { statusCode: response.status, data: responseData } };
        }
        catch (error) {
            const msg = error?.name === 'AbortError' ? 'Webhook timed out after 10s' : (error instanceof Error ? error.message : String(error));
            return { status: 'FAILED', errorMessage: msg };
        }
    }
};
exports.WebhookAction = WebhookAction;
exports.WebhookAction = WebhookAction = WebhookAction_1 = __decorate([
    (0, common_1.Injectable)()
], WebhookAction);
//# sourceMappingURL=webhook.action.js.map