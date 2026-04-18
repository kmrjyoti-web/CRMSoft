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
var SettingsSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsSeederService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const working_client_1 = require("@prisma/working-client");
const SEED_SEQUENCES = [
    { entityName: 'Lead', prefix: 'L', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: working_client_1.SequenceResetPolicy.YEARLY },
    { entityName: 'Contact', prefix: 'C', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: working_client_1.SequenceResetPolicy.YEARLY },
    { entityName: 'Organization', prefix: 'ORG', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: working_client_1.SequenceResetPolicy.YEARLY },
    { entityName: 'Quotation', prefix: 'QTN', formatPattern: '{PREFIX}/{YY}{MM}/{SEQ:4}', resetPolicy: working_client_1.SequenceResetPolicy.MONTHLY },
    { entityName: 'Invoice', prefix: 'INV', formatPattern: '{PREFIX}-{YYYY}-{MM}-{SEQ:4}', resetPolicy: working_client_1.SequenceResetPolicy.YEARLY },
    { entityName: 'Ticket', prefix: 'TKT', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: working_client_1.SequenceResetPolicy.YEARLY },
    { entityName: 'Activity', prefix: 'ACT', formatPattern: '{PREFIX}-{YYYY}{MM}{DD}-{SEQ:4}', resetPolicy: working_client_1.SequenceResetPolicy.DAILY },
    { entityName: 'ProformaInvoice', prefix: 'PI', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: working_client_1.SequenceResetPolicy.YEARLY },
];
const WEEK_SCHEDULE = [
    { day: working_client_1.DayOfWeek.MONDAY, working: true }, { day: working_client_1.DayOfWeek.TUESDAY, working: true },
    { day: working_client_1.DayOfWeek.WEDNESDAY, working: true }, { day: working_client_1.DayOfWeek.THURSDAY, working: true },
    { day: working_client_1.DayOfWeek.FRIDAY, working: true }, { day: working_client_1.DayOfWeek.SATURDAY, working: true },
    { day: working_client_1.DayOfWeek.SUNDAY, working: false },
];
const HOLIDAYS = [
    { name: 'Republic Day', date: '01-26', type: 'NATIONAL', recurring: true },
    { name: 'Holi', date: '03-14', type: 'NATIONAL', recurring: false },
    { name: 'Good Friday', date: '04-18', type: 'NATIONAL', recurring: false },
    { name: 'Dr. Ambedkar Jayanti', date: '04-14', type: 'NATIONAL', recurring: true },
    { name: 'May Day', date: '05-01', type: 'NATIONAL', recurring: true },
    { name: 'Independence Day', date: '08-15', type: 'NATIONAL', recurring: true },
    { name: 'Ganesh Chaturthi', date: '09-05', type: 'REGIONAL', recurring: false, states: ['MH', 'GJ', 'KA', 'AP', 'TG'] },
    { name: 'Mahatma Gandhi Jayanti', date: '10-02', type: 'NATIONAL', recurring: true },
    { name: 'Dussehra', date: '10-02', type: 'NATIONAL', recurring: false },
    { name: 'Diwali', date: '10-21', type: 'NATIONAL', recurring: false },
    { name: 'Guru Nanak Jayanti', date: '11-15', type: 'NATIONAL', recurring: false },
    { name: 'Christmas', date: '12-25', type: 'NATIONAL', recurring: true },
];
const NOTIF_EVENTS = [
    { code: 'LEAD_CREATED', name: 'New Lead Created', cat: 'LEAD', inApp: true, email: false, owner: false, creator: false, manager: false, admin: true },
    { code: 'LEAD_ASSIGNED', name: 'Lead Assigned to You', cat: 'LEAD', inApp: true, email: true, owner: true, creator: false, manager: false, admin: false },
    { code: 'LEAD_STATUS_CHANGED', name: 'Lead Status Changed', cat: 'LEAD', inApp: true, email: false, owner: true, creator: false, manager: false, admin: false },
    { code: 'LEAD_WON', name: 'Deal Won!', cat: 'LEAD', inApp: true, email: true, owner: true, creator: false, manager: true, admin: true },
    { code: 'LEAD_LOST', name: 'Deal Lost', cat: 'LEAD', inApp: true, email: false, owner: true, creator: false, manager: true, admin: false },
    { code: 'LEAD_STALE', name: 'Lead Going Stale', cat: 'LEAD', inApp: true, email: true, owner: true, creator: false, manager: false, admin: false },
    { code: 'ACTIVITY_ASSIGNED', name: 'Activity Assigned', cat: 'ACTIVITY', inApp: true, email: false, owner: true, creator: false, manager: false, admin: false },
    { code: 'ACTIVITY_OVERDUE', name: 'Activity Overdue', cat: 'ACTIVITY', inApp: true, email: true, owner: true, creator: false, manager: false, admin: false },
    { code: 'ACTIVITY_REMINDER', name: 'Activity Reminder', cat: 'ACTIVITY', inApp: true, email: false, owner: true, creator: false, manager: false, admin: false },
    { code: 'DEMO_SCHEDULED', name: 'Demo Scheduled', cat: 'DEMO', inApp: true, email: true, owner: true, creator: false, manager: false, admin: false },
    { code: 'DEMO_REMINDER', name: 'Demo Reminder (1hr)', cat: 'DEMO', inApp: true, email: true, owner: true, creator: false, manager: false, admin: false },
    { code: 'DEMO_COMPLETED', name: 'Demo Completed', cat: 'DEMO', inApp: true, email: false, owner: true, creator: false, manager: false, admin: false },
    { code: 'DEMO_NO_SHOW', name: 'Demo No-Show', cat: 'DEMO', inApp: true, email: true, owner: true, creator: false, manager: true, admin: false },
    { code: 'QUOTATION_CREATED', name: 'Quotation Created', cat: 'QUOTATION', inApp: true, email: false, owner: true, creator: false, manager: false, admin: false },
    { code: 'QUOTATION_SENT', name: 'Quotation Sent', cat: 'QUOTATION', inApp: true, email: false, owner: true, creator: false, manager: false, admin: false },
    { code: 'QUOTATION_VIEWED', name: 'Quotation Viewed by Client', cat: 'QUOTATION', inApp: true, email: true, owner: true, creator: false, manager: false, admin: false },
    { code: 'QUOTATION_ACCEPTED', name: 'Quotation Accepted', cat: 'QUOTATION', inApp: true, email: true, owner: true, creator: false, manager: true, admin: false },
    { code: 'QUOTATION_REJECTED', name: 'Quotation Rejected', cat: 'QUOTATION', inApp: true, email: true, owner: true, creator: false, manager: false, admin: false },
    { code: 'QUOTATION_EXPIRING', name: 'Quotation Expiring Soon', cat: 'QUOTATION', inApp: true, email: true, owner: true, creator: false, manager: false, admin: false },
    { code: 'TOUR_PLAN_SUBMITTED', name: 'Tour Plan Submitted for Approval', cat: 'TOUR_PLAN', inApp: true, email: true, owner: false, creator: false, manager: true, admin: false },
    { code: 'TOUR_PLAN_APPROVED', name: 'Tour Plan Approved', cat: 'TOUR_PLAN', inApp: true, email: true, owner: true, creator: false, manager: false, admin: false },
    { code: 'TOUR_PLAN_REJECTED', name: 'Tour Plan Rejected', cat: 'TOUR_PLAN', inApp: true, email: true, owner: true, creator: false, manager: false, admin: false },
    { code: 'IMPORT_COMPLETED', name: 'Bulk Import Completed', cat: 'SYSTEM', inApp: true, email: true, owner: false, creator: true, manager: false, admin: false },
    { code: 'EXPORT_COMPLETED', name: 'Data Export Ready', cat: 'SYSTEM', inApp: true, email: true, owner: false, creator: true, manager: false, admin: false },
    { code: 'SYSTEM_ERROR_ALERT', name: 'System Error Alert', cat: 'SYSTEM', inApp: true, email: true, owner: false, creator: false, manager: false, admin: true },
    { code: 'BACKUP_COMPLETED', name: 'Backup Completed', cat: 'SYSTEM', inApp: false, email: true, owner: false, creator: false, manager: false, admin: true },
    { code: 'USER_ADDED', name: 'New User Added', cat: 'USER', inApp: true, email: true, owner: false, creator: false, manager: false, admin: true },
    { code: 'USER_DEACTIVATED', name: 'User Deactivated', cat: 'USER', inApp: true, email: false, owner: false, creator: false, manager: false, admin: true },
    { code: 'PASSWORD_CHANGED', name: 'Password Changed', cat: 'USER', inApp: true, email: true, owner: true, creator: false, manager: false, admin: false },
];
const RETENTION_POLICIES = [
    { entityName: 'Lead', displayName: 'Leads', retentionDays: 365, action: 'ARCHIVE', scopeFilter: { status: { in: ['LOST', 'ON_HOLD'] } } },
    { entityName: 'Activity', displayName: 'Activities', retentionDays: 180, action: 'ARCHIVE', scopeFilter: {} },
    { entityName: 'Notification', displayName: 'Notifications', retentionDays: 90, action: 'HARD_DELETE', scopeFilter: {} },
    { entityName: 'AuditLog', displayName: 'Audit Logs', retentionDays: 365, action: 'ARCHIVE', scopeFilter: {} },
    { entityName: 'ErrorLog', displayName: 'Error Logs', retentionDays: 90, action: 'HARD_DELETE', scopeFilter: {} },
    { entityName: 'SyncChangeLog', displayName: 'Sync Change Logs', retentionDays: 30, action: 'HARD_DELETE', scopeFilter: {} },
    { entityName: 'CronJobRunLog', displayName: 'Cron Job Logs', retentionDays: 90, action: 'HARD_DELETE', scopeFilter: {} },
];
let SettingsSeederService = SettingsSeederService_1 = class SettingsSeederService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SettingsSeederService_1.name);
    }
    async seedAll(tenantId, companyName) {
        this.logger.log(`Seeding settings for tenant ${tenantId}`);
        await Promise.all([
            this.seedBranding(tenantId),
            this.seedBusinessHours(tenantId),
            this.seedHolidays(tenantId),
            this.seedAutoNumbers(tenantId),
            this.seedCompanyProfile(tenantId, companyName),
            this.seedNotifPrefs(tenantId),
            this.seedSecurityPolicy(tenantId),
            this.seedRetention(tenantId),
            this.seedEmailFooter(tenantId, companyName),
        ]);
        this.logger.log(`Settings seeded for tenant ${tenantId}`);
    }
    async seedBranding(tid) {
        await this.prisma.identity.tenantBranding.upsert({ where: { tenantId: tid }, update: {}, create: { tenantId: tid } });
    }
    async seedBusinessHours(tid) {
        for (const s of WEEK_SCHEDULE) {
            await this.prisma.businessHoursSchedule.upsert({
                where: { tenantId_dayOfWeek: { tenantId: tid, dayOfWeek: s.day } },
                update: {},
                create: {
                    tenantId: tid, dayOfWeek: s.day, isWorkingDay: s.working,
                    startTime: s.working ? '09:00' : null, endTime: s.working ? '18:00' : null,
                    breakStartTime: s.working ? '13:00' : null, breakEndTime: s.working ? '14:00' : null,
                },
            });
        }
    }
    async seedHolidays(tid) {
        const year = new Date().getFullYear();
        for (const h of HOLIDAYS) {
            const [mm, dd] = h.date.split('-');
            await this.prisma.holidayCalendar.create({
                data: {
                    tenantId: tid, name: h.name, date: new Date(`${year}-${mm}-${dd}`),
                    type: h.type, isRecurring: h.recurring, applicableStates: h.states ?? [],
                },
            });
        }
    }
    async seedAutoNumbers(tid) {
        for (const s of SEED_SEQUENCES) {
            await this.prisma.autoNumberSequence.upsert({
                where: { tenantId_entityName: { tenantId: tid, entityName: s.entityName } },
                update: {},
                create: { tenantId: tid, ...s, startFrom: 1, incrementBy: 1, seqPadding: 5 },
            });
        }
    }
    async seedCompanyProfile(tid, name) {
        await this.prisma.companyProfile.upsert({
            where: { tenantId: tid }, update: {},
            create: { tenantId: tid, companyName: name },
        });
    }
    async seedNotifPrefs(tid) {
        for (const e of NOTIF_EVENTS) {
            await this.prisma.notificationConfig.upsert({
                where: { tenantId_eventCode: { tenantId: tid, eventCode: e.code } },
                update: {},
                create: {
                    tenantId: tid, eventCode: e.code, eventName: e.name, eventCategory: e.cat,
                    enableInAppAlert: e.inApp, enableEmail: e.email,
                    notifyAssignee: e.owner, notifyCreator: e.creator, notifyManager: e.manager, notifyAdmin: e.admin,
                    isSystem: true,
                },
            });
        }
    }
    async seedSecurityPolicy(tid) {
        await this.prisma.identity.securityPolicy.upsert({ where: { tenantId: tid }, update: {}, create: { tenantId: tid } });
    }
    async seedRetention(tid) {
        for (const r of RETENTION_POLICIES) {
            await this.prisma.identity.dataRetentionPolicy.upsert({
                where: { tenantId_entityName: { tenantId: tid, entityName: r.entityName } },
                update: {},
                create: { tenantId: tid, ...r, isEnabled: false },
            });
        }
    }
    async seedEmailFooter(tid, name) {
        const existing = await this.prisma.emailFooterTemplate.findFirst({ where: { tenantId: tid } });
        if (existing)
            return;
        await this.prisma.emailFooterTemplate.create({
            data: {
                tenantId: tid, name: 'Default Footer', isDefault: true,
                bodyHtml: `<div style="padding:20px;text-align:center;color:#666;font-size:12px;border-top:1px solid #eee;margin-top:20px"><p><strong>${name}</strong></p><p>{{companyLogoUrl}}</p><p>This email is confidential and intended for the recipient only.</p><p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p></div>`,
            },
        });
    }
};
exports.SettingsSeederService = SettingsSeederService;
exports.SettingsSeederService = SettingsSeederService = SettingsSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsSeederService);
//# sourceMappingURL=settings-seeder.service.js.map