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
var CalendarSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarSyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const google_calendar_adapter_1 = require("./adapters/google-calendar.adapter");
const outlook_calendar_adapter_1 = require("./adapters/outlook-calendar.adapter");
let CalendarSyncService = CalendarSyncService_1 = class CalendarSyncService {
    constructor(prisma, googleAdapter, outlookAdapter) {
        this.prisma = prisma;
        this.googleAdapter = googleAdapter;
        this.outlookAdapter = outlookAdapter;
        this.logger = new common_1.Logger(CalendarSyncService_1.name);
        this.adapters = new Map();
        this.adapters.set('GOOGLE', this.googleAdapter);
        this.adapters.set('OUTLOOK', this.outlookAdapter);
    }
    async syncEvent(input) {
        const existing = await this.prisma.working.calendarEvent.findFirst({
            where: { eventType: input.eventType, sourceId: input.sourceId },
        });
        if (existing) {
            return this.prisma.working.calendarEvent.update({
                where: { id: existing.id },
                data: {
                    title: input.title,
                    description: input.description,
                    startTime: input.startTime,
                    endTime: input.endTime,
                    allDay: input.allDay || false,
                    color: input.color,
                },
            });
        }
        else {
            return this.prisma.working.calendarEvent.create({
                data: {
                    eventType: input.eventType,
                    sourceId: input.sourceId,
                    title: input.title,
                    description: input.description,
                    startTime: input.startTime,
                    endTime: input.endTime,
                    allDay: input.allDay || false,
                    color: input.color,
                    userId: input.userId,
                },
            });
        }
    }
    async removeEvent(eventType, sourceId) {
        await this.prisma.working.calendarEvent.updateMany({
            where: { eventType, sourceId },
            data: { isActive: false },
        });
    }
    async connectProvider(userId, tenantId, provider, accessToken, refreshToken, expiresAt, calendarId, externalEmail) {
        const sync = await this.prisma.working.userCalendarSync.upsert({
            where: {
                tenantId_userId_provider: { tenantId, userId, provider },
            },
            update: {
                accessToken,
                refreshToken,
                tokenExpiresAt: expiresAt,
                calendarId,
                externalEmail,
                status: 'ACTIVE',
                errorMessage: null,
                isActive: true,
            },
            create: {
                tenantId,
                userId,
                provider,
                accessToken,
                refreshToken,
                tokenExpiresAt: expiresAt,
                calendarId,
                externalEmail,
                status: 'ACTIVE',
            },
        });
        this.logger.log(`Connected ${provider} calendar for user ${userId}`);
        return sync;
    }
    async disconnectProvider(userId, tenantId, provider) {
        await this.prisma.working.userCalendarSync.updateMany({
            where: { tenantId, userId, provider },
            data: {
                status: 'DISCONNECTED',
                isActive: false,
                accessToken: null,
                refreshToken: null,
                syncToken: null,
            },
        });
        this.logger.log(`Disconnected ${provider} calendar for user ${userId}`);
    }
    async triggerSync(userId, tenantId, provider) {
        const sync = await this.prisma.working.userCalendarSync.findUnique({
            where: {
                tenantId_userId_provider: { tenantId, userId, provider },
            },
        });
        if (!sync || !sync.isActive || sync.status !== 'ACTIVE') {
            this.logger.warn(`No active sync found for user ${userId} / ${provider}`);
            return { inbound: 0, outbound: 0 };
        }
        let inbound = 0;
        let outbound = 0;
        try {
            inbound = await this.syncInbound(sync);
            outbound = await this.syncOutbound(sync);
            await this.prisma.working.userCalendarSync.update({
                where: { id: sync.id },
                data: { lastSyncAt: new Date(), errorMessage: null },
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Sync failed for ${provider}: ${message}`);
            await this.prisma.working.userCalendarSync.update({
                where: { id: sync.id },
                data: { errorMessage: message, status: 'ERROR' },
            });
        }
        return { inbound, outbound };
    }
    async getSyncStatus(userId, tenantId) {
        return this.prisma.working.userCalendarSync.findMany({
            where: { tenantId, userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async syncInbound(sync) {
        const adapter = this.adapters.get(sync.provider);
        if (!adapter || !sync.accessToken || !sync.calendarId) {
            this.logger.warn(`Cannot sync inbound: missing adapter or credentials for ${sync.provider}`);
            return 0;
        }
        const { events, nextSyncToken } = await adapter.listEvents(sync.accessToken, sync.calendarId, sync.syncToken || undefined);
        let processed = 0;
        for (const ext of events) {
            const existing = await this.prisma.working.scheduledEvent.findFirst({
                where: {
                    tenantId: sync.tenantId,
                    externalEventId: ext.id,
                    syncProvider: sync.provider,
                },
            });
            if (existing) {
                await this.prisma.working.scheduledEvent.update({
                    where: { id: existing.id },
                    data: {
                        title: ext.title,
                        description: ext.description,
                        startTime: ext.startTime,
                        endTime: ext.endTime,
                        allDay: ext.allDay ?? false,
                        location: ext.location,
                    },
                });
            }
            else {
                const count = await this.prisma.working.scheduledEvent.count({
                    where: { tenantId: sync.tenantId },
                });
                const eventNumber = `EVT-${String(count + 1).padStart(5, '0')}`;
                await this.prisma.working.scheduledEvent.create({
                    data: {
                        tenantId: sync.tenantId,
                        eventNumber,
                        type: 'OTHER',
                        title: ext.title,
                        description: ext.description,
                        startTime: ext.startTime,
                        endTime: ext.endTime,
                        allDay: ext.allDay ?? false,
                        location: ext.location,
                        organizerId: sync.userId,
                        createdById: sync.userId,
                        externalEventId: ext.id,
                        syncProvider: sync.provider,
                    },
                });
            }
            processed++;
        }
        if (nextSyncToken) {
            await this.prisma.working.userCalendarSync.update({
                where: { id: sync.id },
                data: { syncToken: nextSyncToken },
            });
        }
        this.logger.log(`Inbound sync: ${processed} events from ${sync.provider}`);
        return processed;
    }
    async syncOutbound(sync) {
        const adapter = this.adapters.get(sync.provider);
        if (!adapter || !sync.accessToken || !sync.calendarId) {
            this.logger.warn(`Cannot sync outbound: missing adapter or credentials for ${sync.provider}`);
            return 0;
        }
        const events = await this.prisma.working.scheduledEvent.findMany({
            where: {
                tenantId: sync.tenantId,
                organizerId: sync.userId,
                isActive: true,
                status: { notIn: ['CANCELLED'] },
                externalEventId: null,
                ...(sync.lastSyncAt ? { updatedAt: { gte: sync.lastSyncAt } } : {}),
            },
            take: 100,
        });
        let pushed = 0;
        for (const event of events) {
            try {
                const externalId = await adapter.createEvent(sync.accessToken, sync.calendarId, {
                    title: event.title,
                    description: event.description || undefined,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    allDay: event.allDay,
                    location: event.location || undefined,
                });
                await this.prisma.working.scheduledEvent.update({
                    where: { id: event.id },
                    data: {
                        externalEventId: externalId,
                        syncProvider: sync.provider,
                    },
                });
                pushed++;
            }
            catch (error) {
                this.logger.warn(`Failed to push event ${event.id} to ${sync.provider}: ${error instanceof Error ? error.message : error}`);
            }
        }
        this.logger.log(`Outbound sync: ${pushed} events to ${sync.provider}`);
        return pushed;
    }
    async handleWebhook(provider, payload) {
        this.logger.log(`Received webhook from ${provider}: ${JSON.stringify(payload).slice(0, 200)}`);
        const channelId = payload.channelId || payload.subscriptionId;
        if (!channelId) {
            this.logger.warn(`Webhook from ${provider} missing channel/subscription ID`);
            return;
        }
        const sync = await this.prisma.working.userCalendarSync.findFirst({
            where: { provider: provider, webhookId: channelId, isActive: true },
        });
        if (sync) {
            await this.triggerSync(sync.userId, sync.tenantId, provider);
        }
        else {
            this.logger.warn(`No sync record found for webhook channel ${channelId}`);
        }
    }
};
exports.CalendarSyncService = CalendarSyncService;
exports.CalendarSyncService = CalendarSyncService = CalendarSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        google_calendar_adapter_1.GoogleCalendarAdapter,
        outlook_calendar_adapter_1.OutlookCalendarAdapter])
], CalendarSyncService);
//# sourceMappingURL=calendar-sync.service.js.map