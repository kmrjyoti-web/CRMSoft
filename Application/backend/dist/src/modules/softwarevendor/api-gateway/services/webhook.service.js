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
var WebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../common/errors/app-error");
const AVAILABLE_WEBHOOK_EVENTS = [
    { event: 'lead.created', description: 'New lead created' },
    { event: 'lead.updated', description: 'Lead details updated' },
    { event: 'lead.deleted', description: 'Lead deleted' },
    { event: 'lead.status_changed', description: 'Lead status changed' },
    { event: 'lead.assigned', description: 'Lead assigned to user' },
    { event: 'lead.won', description: 'Deal marked as won' },
    { event: 'lead.lost', description: 'Deal marked as lost' },
    { event: 'contact.created', description: 'New contact created' },
    { event: 'contact.updated', description: 'Contact updated' },
    { event: 'contact.deleted', description: 'Contact deleted' },
    { event: 'organization.created', description: 'Organization created' },
    { event: 'organization.updated', description: 'Organization updated' },
    { event: 'activity.created', description: 'Activity created' },
    { event: 'activity.completed', description: 'Activity completed' },
    { event: 'demo.scheduled', description: 'Demo scheduled' },
    { event: 'demo.completed', description: 'Demo completed' },
    { event: 'quotation.created', description: 'Quotation created' },
    { event: 'quotation.sent', description: 'Quotation sent' },
    { event: 'quotation.accepted', description: 'Quotation accepted' },
    { event: 'invoice.created', description: 'Invoice generated' },
    { event: 'invoice.sent', description: 'Invoice sent' },
    { event: 'invoice.paid', description: 'Invoice fully paid' },
    { event: 'invoice.overdue', description: 'Invoice overdue' },
    { event: 'payment.received', description: 'Payment received' },
    { event: 'payment.failed', description: 'Payment failed' },
    { event: 'payment.refunded', description: 'Payment refunded' },
    { event: 'document.uploaded', description: 'Document uploaded' },
];
let WebhookService = WebhookService_1 = class WebhookService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WebhookService_1.name);
    }
    async create(tenantId, dto, userId, userName) {
        const secret = (0, crypto_1.randomBytes)(32).toString('hex');
        const endpoint = await this.prisma.working.webhookEndpoint.create({
            data: {
                tenantId,
                url: dto.url,
                description: dto.description,
                secret,
                events: dto.events,
                timeoutSeconds: dto.timeoutSeconds || 30,
                maxRetries: dto.maxRetries || 5,
                customHeaders: dto.customHeaders || undefined,
                createdById: userId,
                createdByName: userName,
            },
        });
        this.logger.log(`Webhook endpoint created for ${dto.url}`);
        return {
            endpoint,
            secret,
            warning: 'Copy this secret now. It will not be shown again.',
        };
    }
    async listByTenant(tenantId) {
        return this.prisma.working.webhookEndpoint.findMany({
            where: { tenantId },
            select: {
                id: true, url: true, description: true, events: true, status: true,
                lastDeliveredAt: true, lastFailedAt: true, totalDelivered: true, totalFailed: true,
                consecutiveFailures: true, createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getById(tenantId, endpointId) {
        const ep = await this.prisma.working.webhookEndpoint.findFirst({
            where: { id: endpointId, tenantId },
        });
        if (!ep)
            throw app_error_1.AppError.from('WEBHOOK_NOT_FOUND');
        return ep;
    }
    async update(tenantId, endpointId, dto) {
        const ep = await this.prisma.working.webhookEndpoint.findFirst({
            where: { id: endpointId, tenantId },
        });
        if (!ep)
            throw app_error_1.AppError.from('WEBHOOK_NOT_FOUND');
        return this.prisma.working.webhookEndpoint.update({
            where: { id: endpointId },
            data: dto,
        });
    }
    async delete(tenantId, endpointId) {
        const ep = await this.prisma.working.webhookEndpoint.findFirst({
            where: { id: endpointId, tenantId },
        });
        if (!ep)
            throw app_error_1.AppError.from('WEBHOOK_NOT_FOUND');
        await this.prisma.working.webhookEndpoint.delete({ where: { id: endpointId } });
    }
    async getActiveEndpointsForEvent(tenantId, eventType) {
        const endpoints = await this.prisma.working.webhookEndpoint.findMany({
            where: { tenantId, status: 'WH_ACTIVE' },
        });
        return endpoints.filter(ep => ep.events.includes(eventType));
    }
    getAvailableEvents() {
        return AVAILABLE_WEBHOOK_EVENTS;
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map