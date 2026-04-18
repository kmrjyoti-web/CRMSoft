import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ICronJobHandler, CronJobResult } from '../services/job-registry.service';
import { CalendarSyncService } from '../../../customer/calendar/calendar-sync.service';
import { NotificationDispatchService } from '../../../core/work/notifications/services/notification-dispatch.service';
export declare class ProcessEventRemindersHandler implements ICronJobHandler {
    private readonly prisma;
    private readonly notificationDispatch;
    readonly jobCode = "PROCESS_EVENT_REMINDERS";
    private readonly logger;
    constructor(prisma: PrismaService, notificationDispatch: NotificationDispatchService);
    execute(): Promise<CronJobResult>;
}
export declare class SyncExternalCalendarsHandler implements ICronJobHandler {
    private readonly prisma;
    private readonly calendarSyncService;
    readonly jobCode = "SYNC_EXTERNAL_CALENDARS";
    private readonly logger;
    constructor(prisma: PrismaService, calendarSyncService: CalendarSyncService);
    execute(): Promise<CronJobResult>;
}
export declare class RenewCalendarWebhooksHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "RENEW_CALENDAR_WEBHOOKS";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class AutoCompletePastEventsHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "AUTO_COMPLETE_PAST_EVENTS";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
}
export declare class GenerateRecurringEventsHandler implements ICronJobHandler {
    private readonly prisma;
    readonly jobCode = "GENERATE_RECURRING_EVENTS";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(): Promise<CronJobResult>;
    private calculateNextDate;
}
