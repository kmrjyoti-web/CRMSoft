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
var ProcessEventRemindersHandler_1, SyncExternalCalendarsHandler_1, RenewCalendarWebhooksHandler_1, AutoCompletePastEventsHandler_1, GenerateRecurringEventsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateRecurringEventsHandler = exports.AutoCompletePastEventsHandler = exports.RenewCalendarWebhooksHandler = exports.SyncExternalCalendarsHandler = exports.ProcessEventRemindersHandler = void 0;
const common_1 = require("@nestjs/common");
const working_client_1 = require("@prisma/working-client");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const calendar_sync_service_1 = require("../../../customer/calendar/calendar-sync.service");
const notification_dispatch_service_1 = require("../../../core/work/notifications/services/notification-dispatch.service");
const cross_service_decorator_1 = require("../../../../common/decorators/cross-service.decorator");
let ProcessEventRemindersHandler = ProcessEventRemindersHandler_1 = class ProcessEventRemindersHandler {
    constructor(prisma, notificationDispatch) {
        this.prisma = prisma;
        this.notificationDispatch = notificationDispatch;
        this.jobCode = 'PROCESS_EVENT_REMINDERS';
        this.logger = new common_1.Logger(ProcessEventRemindersHandler_1.name);
    }
    async execute() {
        const now = new Date();
        let processed = 0;
        const events = await this.prisma.working.scheduledEvent.findMany({
            where: {
                isActive: true,
                status: { notIn: ['CANCELLED', 'COMPLETED'] },
                startTime: { gt: now },
                NOT: { reminderMinutes: { equals: working_client_1.Prisma.DbNull } },
            },
            include: {
                participants: { select: { userId: true } },
            },
            take: 200,
        });
        for (const event of events) {
            try {
                const reminderMinutes = event.reminderMinutes;
                if (!reminderMinutes || !Array.isArray(reminderMinutes))
                    continue;
                const diffMinutes = (event.startTime.getTime() - now.getTime()) / 60000;
                for (const minutes of reminderMinutes) {
                    if (diffMinutes <= minutes && diffMinutes > minutes - 1) {
                        const dispatchEvent = {
                            tenantId: event.tenantId,
                            eventType: 'ACTIVITY_REMINDER',
                            entityType: 'scheduled_event',
                            entityId: event.id,
                            actorId: event.organizerId,
                            data: {
                                reminderTitle: event.title,
                                eventTitle: event.title,
                                startTime: event.startTime.toISOString(),
                                minutesUntilStart: Math.round(diffMinutes),
                            },
                        };
                        await this.notificationDispatch.dispatch(dispatchEvent);
                        processed++;
                        break;
                    }
                }
            }
            catch (error) {
                this.logger.error(`Failed to process reminder for event ${event.id}: ${error instanceof Error ? error.message : error}`);
            }
        }
        return { recordsProcessed: processed };
    }
};
exports.ProcessEventRemindersHandler = ProcessEventRemindersHandler;
exports.ProcessEventRemindersHandler = ProcessEventRemindersHandler = ProcessEventRemindersHandler_1 = __decorate([
    (0, cross_service_decorator_1.CrossService)('work', 'Uses NotificationDispatchService from core/work to dispatch event reminder notifications to users'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_dispatch_service_1.NotificationDispatchService])
], ProcessEventRemindersHandler);
let SyncExternalCalendarsHandler = SyncExternalCalendarsHandler_1 = class SyncExternalCalendarsHandler {
    constructor(prisma, calendarSyncService) {
        this.prisma = prisma;
        this.calendarSyncService = calendarSyncService;
        this.jobCode = 'SYNC_EXTERNAL_CALENDARS';
        this.logger = new common_1.Logger(SyncExternalCalendarsHandler_1.name);
    }
    async execute() {
        const syncs = await this.prisma.working.userCalendarSync.findMany({
            where: {
                isActive: true,
                status: 'ACTIVE',
                provider: { in: ['GOOGLE', 'OUTLOOK'] },
            },
            take: 100,
        });
        let processed = 0;
        let failed = 0;
        for (const sync of syncs) {
            try {
                await this.calendarSyncService.triggerSync(sync.userId, sync.tenantId, sync.provider);
                processed++;
            }
            catch (error) {
                this.logger.error(`External sync failed for user ${sync.userId} / ${sync.provider}: ${error instanceof Error ? error.message : error}`);
                failed++;
            }
        }
        return { recordsProcessed: syncs.length, recordsSucceeded: processed, recordsFailed: failed };
    }
};
exports.SyncExternalCalendarsHandler = SyncExternalCalendarsHandler;
exports.SyncExternalCalendarsHandler = SyncExternalCalendarsHandler = SyncExternalCalendarsHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        calendar_sync_service_1.CalendarSyncService])
], SyncExternalCalendarsHandler);
let RenewCalendarWebhooksHandler = RenewCalendarWebhooksHandler_1 = class RenewCalendarWebhooksHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'RENEW_CALENDAR_WEBHOOKS';
        this.logger = new common_1.Logger(RenewCalendarWebhooksHandler_1.name);
    }
    async execute() {
        const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const expiring = await this.prisma.working.userCalendarSync.findMany({
            where: {
                isActive: true,
                status: 'ACTIVE',
                webhookId: { not: null },
                webhookExpiry: { lt: twentyFourHoursFromNow },
            },
        });
        for (const sync of expiring) {
            this.logger.warn(`Webhook renewal needed for user ${sync.userId} / ${sync.provider} ` +
                `(expires: ${sync.webhookExpiry?.toISOString()}). Stub: renewal not yet implemented.`);
        }
        return {
            recordsProcessed: expiring.length,
            details: { message: 'Webhook renewal is a stub — pending provider API integration' },
        };
    }
};
exports.RenewCalendarWebhooksHandler = RenewCalendarWebhooksHandler;
exports.RenewCalendarWebhooksHandler = RenewCalendarWebhooksHandler = RenewCalendarWebhooksHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RenewCalendarWebhooksHandler);
let AutoCompletePastEventsHandler = AutoCompletePastEventsHandler_1 = class AutoCompletePastEventsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'AUTO_COMPLETE_PAST_EVENTS';
        this.logger = new common_1.Logger(AutoCompletePastEventsHandler_1.name);
    }
    async execute() {
        const now = new Date();
        const result = await this.prisma.working.scheduledEvent.updateMany({
            where: {
                isActive: true,
                endTime: { lt: now },
                status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
            },
            data: { status: 'COMPLETED' },
        });
        if (result.count > 0) {
            this.logger.log(`Auto-completed ${result.count} past events`);
        }
        return { recordsProcessed: result.count };
    }
};
exports.AutoCompletePastEventsHandler = AutoCompletePastEventsHandler;
exports.AutoCompletePastEventsHandler = AutoCompletePastEventsHandler = AutoCompletePastEventsHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutoCompletePastEventsHandler);
let GenerateRecurringEventsHandler = GenerateRecurringEventsHandler_1 = class GenerateRecurringEventsHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.jobCode = 'GENERATE_RECURRING_EVENTS';
        this.logger = new common_1.Logger(GenerateRecurringEventsHandler_1.name);
    }
    async execute() {
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const recurringEvents = await this.prisma.working.scheduledEvent.findMany({
            where: {
                isActive: true,
                recurrencePattern: { not: 'NONE' },
                parentEventId: null,
            },
            take: 100,
        });
        let created = 0;
        for (const event of recurringEvents) {
            try {
                const latestChild = await this.prisma.working.scheduledEvent.findFirst({
                    where: { parentEventId: event.id, isActive: true },
                    orderBy: { startTime: 'desc' },
                });
                const lastStart = latestChild ? latestChild.startTime : event.startTime;
                const duration = event.endTime.getTime() - event.startTime.getTime();
                let nextStart = this.calculateNextDate(lastStart, event.recurrencePattern);
                if (!nextStart)
                    continue;
                while (nextStart <= thirtyDaysFromNow) {
                    const exists = await this.prisma.working.scheduledEvent.findFirst({
                        where: {
                            parentEventId: event.id,
                            startTime: nextStart,
                            isActive: true,
                        },
                    });
                    if (!exists) {
                        const count = await this.prisma.working.scheduledEvent.count({
                            where: { tenantId: event.tenantId },
                        });
                        const eventNumber = `EVT-${String(count + 1).padStart(5, '0')}`;
                        await this.prisma.working.scheduledEvent.create({
                            data: {
                                tenantId: event.tenantId,
                                eventNumber,
                                type: event.type,
                                title: event.title,
                                description: event.description,
                                location: event.location,
                                meetingLink: event.meetingLink,
                                startTime: nextStart,
                                endTime: new Date(nextStart.getTime() + duration),
                                allDay: event.allDay,
                                timezone: event.timezone,
                                color: event.color,
                                reminderMinutes: event.reminderMinutes ?? working_client_1.Prisma.JsonNull,
                                organizerId: event.organizerId,
                                createdById: event.createdById,
                                parentEventId: event.id,
                                recurrencePattern: 'NONE',
                            },
                        });
                        created++;
                    }
                    nextStart = this.calculateNextDate(nextStart, event.recurrencePattern);
                    if (!nextStart)
                        break;
                }
            }
            catch (error) {
                this.logger.error(`Failed to generate recurring events for ${event.id}: ${error instanceof Error ? error.message : error}`);
            }
        }
        this.logger.log(`Generated ${created} recurring event occurrences`);
        return { recordsProcessed: recurringEvents.length, recordsSucceeded: created };
    }
    calculateNextDate(fromDate, pattern) {
        const next = new Date(fromDate);
        switch (pattern) {
            case 'DAILY':
                next.setDate(next.getDate() + 1);
                break;
            case 'WEEKDAYS': {
                next.setDate(next.getDate() + 1);
                while (next.getDay() === 0 || next.getDay() === 6) {
                    next.setDate(next.getDate() + 1);
                }
                break;
            }
            case 'WEEKLY':
                next.setDate(next.getDate() + 7);
                break;
            case 'BIWEEKLY':
                next.setDate(next.getDate() + 14);
                break;
            case 'MONTHLY':
                next.setMonth(next.getMonth() + 1);
                break;
            case 'MONTHLY_NTH':
                next.setMonth(next.getMonth() + 1);
                break;
            case 'QUARTERLY':
                next.setMonth(next.getMonth() + 3);
                break;
            case 'YEARLY':
                next.setFullYear(next.getFullYear() + 1);
                break;
            default:
                return null;
        }
        return next;
    }
};
exports.GenerateRecurringEventsHandler = GenerateRecurringEventsHandler;
exports.GenerateRecurringEventsHandler = GenerateRecurringEventsHandler = GenerateRecurringEventsHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GenerateRecurringEventsHandler);
//# sourceMappingURL=calendar-handlers.js.map