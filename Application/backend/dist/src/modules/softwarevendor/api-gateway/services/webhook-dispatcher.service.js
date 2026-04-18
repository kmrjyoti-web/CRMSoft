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
var WebhookDispatcherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookDispatcherService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const webhook_service_1 = require("./webhook.service");
const webhook_signer_service_1 = require("./webhook-signer.service");
const RETRY_DELAYS = [0, 60_000, 300_000, 1800_000, 7200_000];
let WebhookDispatcherService = WebhookDispatcherService_1 = class WebhookDispatcherService {
    constructor(prisma, webhookService, signer) {
        this.prisma = prisma;
        this.webhookService = webhookService;
        this.signer = signer;
        this.logger = new common_1.Logger(WebhookDispatcherService_1.name);
    }
    async dispatch(tenantId, eventType, entityId, data) {
        const endpoints = await this.webhookService.getActiveEndpointsForEvent(tenantId, eventType);
        if (endpoints.length === 0)
            return;
        const eventId = (0, crypto_1.randomUUID)();
        const payload = {
            id: eventId,
            type: eventType,
            apiVersion: 'v1',
            createdAt: new Date().toISOString(),
            data: { object: data },
            tenantId,
        };
        for (const endpoint of endpoints) {
            const signature = this.signer.sign(payload, endpoint.secret);
            const payloadStr = JSON.stringify(payload);
            const delivery = await this.prisma.working.webhookDelivery.create({
                data: {
                    tenantId,
                    endpointId: endpoint.id,
                    eventType,
                    eventId,
                    payload,
                    payloadSize: payloadStr.length,
                    signature: `sha256=${signature}`,
                    scheduledAt: new Date(),
                    maxAttempts: endpoint.maxRetries,
                },
            });
            this.attemptDelivery(delivery.id, endpoint, payloadStr, signature).catch(err => {
                this.logger.error(`Delivery failed for ${delivery.id}: ${err.message}`);
            });
        }
    }
    async attemptDelivery(deliveryId, endpoint, payloadStr, signature) {
        const headers = {
            'Content-Type': endpoint.contentType || 'application/json',
            'X-CRM-Signature': `sha256=${signature}`,
            'X-CRM-Event': '',
            'X-CRM-Delivery-Id': deliveryId,
            'X-CRM-Timestamp': String(Math.floor(Date.now() / 1000)),
        };
        if (endpoint.customHeaders) {
            const custom = typeof endpoint.customHeaders === 'object' ? endpoint.customHeaders : {};
            Object.assign(headers, custom);
        }
        const start = Date.now();
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), (endpoint.timeoutSeconds || 30) * 1000);
            const response = await fetch(endpoint.url, {
                method: 'POST',
                headers,
                body: payloadStr,
                signal: controller.signal,
            });
            clearTimeout(timeout);
            const responseTimeMs = Date.now() - start;
            const responseBody = await response.text().catch(() => '');
            if (response.ok) {
                await this.prisma.working.webhookDelivery.update({
                    where: { id: deliveryId },
                    data: {
                        status: 'WH_DELIVERED',
                        httpStatus: response.status,
                        responseBody: responseBody.substring(0, 4096),
                        responseTimeMs,
                        deliveredAt: new Date(),
                    },
                });
                await this.prisma.working.webhookEndpoint.update({
                    where: { id: endpoint.id },
                    data: {
                        lastDeliveredAt: new Date(),
                        totalDelivered: { increment: 1 },
                        consecutiveFailures: 0,
                    },
                });
            }
            else {
                await this.handleFailure(deliveryId, endpoint.id, `HTTP ${response.status}`, response.status, responseTimeMs);
            }
        }
        catch (err) {
            const responseTimeMs = Date.now() - start;
            await this.handleFailure(deliveryId, endpoint.id, err.message, null, responseTimeMs);
        }
    }
    async handleFailure(deliveryId, endpointId, error, httpStatus, responseTimeMs) {
        const delivery = await this.prisma.working.webhookDelivery.findUnique({ where: { id: deliveryId } });
        if (!delivery)
            return;
        const nextAttempt = delivery.attempt + 1;
        const canRetry = nextAttempt <= delivery.maxAttempts;
        const nextRetryAt = canRetry
            ? new Date(Date.now() + (RETRY_DELAYS[Math.min(nextAttempt - 1, RETRY_DELAYS.length - 1)] || 7200_000))
            : null;
        await this.prisma.working.webhookDelivery.update({
            where: { id: deliveryId },
            data: {
                status: canRetry ? 'WH_RETRYING' : 'WH_DELIVERY_FAILED',
                httpStatus,
                error,
                responseTimeMs,
                attempt: nextAttempt,
                nextRetryAt,
            },
        });
        const endpoint = await this.prisma.working.webhookEndpoint.update({
            where: { id: endpointId },
            data: {
                lastFailedAt: new Date(),
                lastError: error,
                totalFailed: { increment: 1 },
                consecutiveFailures: { increment: 1 },
            },
        });
        if (endpoint.consecutiveFailures >= 10) {
            await this.prisma.working.webhookEndpoint.update({
                where: { id: endpointId },
                data: { status: 'WH_DISABLED' },
            });
            this.logger.warn(`Webhook ${endpointId} auto-disabled after 10 consecutive failures`);
        }
    }
    async retryFailedDeliveries() {
        const now = new Date();
        const deliveries = await this.prisma.working.webhookDelivery.findMany({
            where: {
                status: { in: ['WH_DELIVERY_FAILED', 'WH_RETRYING'] },
                nextRetryAt: { lte: now },
            },
            include: { endpoint: true },
            take: 100,
        });
        let succeeded = 0, failed = 0;
        for (const delivery of deliveries) {
            if (delivery.endpoint.status !== 'WH_ACTIVE')
                continue;
            const payloadStr = JSON.stringify(delivery.payload);
            const signature = this.signer.sign(delivery.payload, delivery.endpoint.secret);
            await this.attemptDelivery(delivery.id, delivery.endpoint, payloadStr, signature);
            const updated = await this.prisma.working.webhookDelivery.findUnique({ where: { id: delivery.id } });
            if (updated?.status === 'WH_DELIVERED')
                succeeded++;
            else
                failed++;
        }
        return { retried: deliveries.length, succeeded, failed };
    }
    async getDeliveries(tenantId, endpointId, page = 1, limit = 20) {
        const [data, total] = await Promise.all([
            this.prisma.working.webhookDelivery.findMany({
                where: { tenantId, endpointId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.webhookDelivery.count({ where: { tenantId, endpointId } }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
};
exports.WebhookDispatcherService = WebhookDispatcherService;
exports.WebhookDispatcherService = WebhookDispatcherService = WebhookDispatcherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        webhook_service_1.WebhookService,
        webhook_signer_service_1.WebhookSignerService])
], WebhookDispatcherService);
//# sourceMappingURL=webhook-dispatcher.service.js.map