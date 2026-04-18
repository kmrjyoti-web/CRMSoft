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
var CalendarConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarConfigService = exports.CALENDAR_CONFIG_DEFAULTS = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
exports.CALENDAR_CONFIG_DEFAULTS = [
    {
        configKey: 'CALENDAR_DEFAULT_VIEW',
        value: { view: 'WEEK', startOfWeek: 1, workingDayStart: '09:00', workingDayEnd: '18:00' },
        description: 'Default calendar view settings',
    },
    {
        configKey: 'CALENDAR_EVENT_COLORS',
        value: {
            TASK: '#4A90D9', ACTIVITY: '#27AE60', DEMO: '#E67E22', TOUR_PLAN: '#8E44AD',
            REMINDER: '#E74C3C', SCHEDULED_EVENT: '#2C3E50', EXTERNAL_GOOGLE: '#4285F4',
            EXTERNAL_OUTLOOK: '#0078D4',
        },
        description: 'Color codes for each event type on the calendar',
    },
    {
        configKey: 'CALENDAR_CONFLICT_POLICY',
        value: { action: 'WARN', allowDoubleBooking: true, showConflictBadge: true },
        description: 'How calendar conflicts are handled',
    },
    {
        configKey: 'CALENDAR_SYNC_SETTINGS',
        value: { enableGoogleSync: true, enableOutlookSync: true, enableICalExport: true, syncIntervalMinutes: 15 },
        description: 'External calendar sync settings',
    },
    {
        configKey: 'CALENDAR_SLOT_SETTINGS',
        value: { defaultDurationMinutes: 30, minDurationMinutes: 15, maxDurationMinutes: 480, bufferBetweenEventsMinutes: 5 },
        description: 'Time slot defaults and constraints',
    },
    {
        configKey: 'CALENDAR_NOTIFICATION_DEFAULTS',
        value: { defaultReminders: [15, 60], sendInviteOnCreate: true, sendUpdateOnReschedule: true, notifyOnRSVP: true },
        description: 'Default notification/reminder settings for events',
    },
    {
        configKey: 'CALENDAR_HOLIDAYS',
        value: {
            holidays: [
                { date: '2026-01-26', name: 'Republic Day', type: 'NATIONAL' },
                { date: '2026-08-15', name: 'Independence Day', type: 'NATIONAL' },
                { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'NATIONAL' },
                { date: '2026-12-25', name: 'Christmas', type: 'NATIONAL' },
            ],
            showHolidaysOnCalendar: true,
        },
        description: 'Holiday calendar configuration',
    },
];
let CalendarConfigService = CalendarConfigService_1 = class CalendarConfigService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CalendarConfigService_1.name);
    }
    async getConfig(tenantId, key) {
        const record = await this.prisma.working.calendarConfig.findUnique({
            where: { tenantId_configKey: { tenantId, configKey: key } },
        });
        return record?.configValue ?? null;
    }
    async getAllConfigs(tenantId) {
        return this.prisma.working.calendarConfig.findMany({
            where: { tenantId, isActive: true },
            orderBy: { configKey: 'asc' },
        });
    }
    async upsertConfig(tenantId, key, value, description, updatedById) {
        return this.prisma.working.calendarConfig.upsert({
            where: { tenantId_configKey: { tenantId, configKey: key } },
            update: { configValue: value, ...(description ? { description } : {}), updatedById },
            create: { tenantId, configKey: key, configValue: value, description, updatedById },
        });
    }
    async resetToDefaults(tenantId, updatedById) {
        await this.prisma.working.calendarConfig.deleteMany({ where: { tenantId } });
        for (const cfg of exports.CALENDAR_CONFIG_DEFAULTS) {
            await this.prisma.working.calendarConfig.create({
                data: {
                    tenantId,
                    configKey: cfg.configKey,
                    configValue: cfg.value,
                    description: cfg.description,
                    updatedById,
                },
            });
        }
        this.logger.log(`Reset ${exports.CALENDAR_CONFIG_DEFAULTS.length} calendar configs to defaults for tenant ${tenantId}`);
    }
};
exports.CalendarConfigService = CalendarConfigService;
exports.CalendarConfigService = CalendarConfigService = CalendarConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarConfigService);
//# sourceMappingURL=calendar-config.service.js.map