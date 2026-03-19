import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { DayOfWeek, NotificationEventCategory, SequenceResetPolicy } from '@prisma/client';

const SEED_SEQUENCES = [
  { entityName: 'Lead', prefix: 'L', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: SequenceResetPolicy.YEARLY },
  { entityName: 'Contact', prefix: 'C', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: SequenceResetPolicy.YEARLY },
  { entityName: 'Organization', prefix: 'ORG', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: SequenceResetPolicy.YEARLY },
  { entityName: 'Quotation', prefix: 'QTN', formatPattern: '{PREFIX}/{YY}{MM}/{SEQ:4}', resetPolicy: SequenceResetPolicy.MONTHLY },
  { entityName: 'Invoice', prefix: 'INV', formatPattern: '{PREFIX}-{YYYY}-{MM}-{SEQ:4}', resetPolicy: SequenceResetPolicy.YEARLY },
  { entityName: 'Ticket', prefix: 'TKT', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: SequenceResetPolicy.YEARLY },
  { entityName: 'Activity', prefix: 'ACT', formatPattern: '{PREFIX}-{YYYY}{MM}{DD}-{SEQ:4}', resetPolicy: SequenceResetPolicy.DAILY },
  { entityName: 'ProformaInvoice', prefix: 'PI', formatPattern: '{PREFIX}-{YYYY}-{SEQ:5}', resetPolicy: SequenceResetPolicy.YEARLY },
];

const WEEK_SCHEDULE = [
  { day: DayOfWeek.MONDAY, working: true }, { day: DayOfWeek.TUESDAY, working: true },
  { day: DayOfWeek.WEDNESDAY, working: true }, { day: DayOfWeek.THURSDAY, working: true },
  { day: DayOfWeek.FRIDAY, working: true }, { day: DayOfWeek.SATURDAY, working: true },
  { day: DayOfWeek.SUNDAY, working: false },
];

const HOLIDAYS = [
  { name: 'Republic Day', date: '01-26', type: 'NATIONAL' as const, recurring: true },
  { name: 'Holi', date: '03-14', type: 'NATIONAL' as const, recurring: false },
  { name: 'Good Friday', date: '04-18', type: 'NATIONAL' as const, recurring: false },
  { name: 'Dr. Ambedkar Jayanti', date: '04-14', type: 'NATIONAL' as const, recurring: true },
  { name: 'May Day', date: '05-01', type: 'NATIONAL' as const, recurring: true },
  { name: 'Independence Day', date: '08-15', type: 'NATIONAL' as const, recurring: true },
  { name: 'Ganesh Chaturthi', date: '09-05', type: 'REGIONAL' as const, recurring: false, states: ['MH', 'GJ', 'KA', 'AP', 'TG'] },
  { name: 'Mahatma Gandhi Jayanti', date: '10-02', type: 'NATIONAL' as const, recurring: true },
  { name: 'Dussehra', date: '10-02', type: 'NATIONAL' as const, recurring: false },
  { name: 'Diwali', date: '10-21', type: 'NATIONAL' as const, recurring: false },
  { name: 'Guru Nanak Jayanti', date: '11-15', type: 'NATIONAL' as const, recurring: false },
  { name: 'Christmas', date: '12-25', type: 'NATIONAL' as const, recurring: true },
];

const NOTIF_EVENTS: { code: string; name: string; cat: NotificationEventCategory;
  inApp: boolean; email: boolean; owner: boolean; creator: boolean; manager: boolean; admin: boolean;
}[] = [
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
  { entityName: 'Lead', displayName: 'Leads', retentionDays: 365, action: 'ARCHIVE' as const, scopeFilter: { status: { in: ['LOST', 'ON_HOLD'] } } },
  { entityName: 'Activity', displayName: 'Activities', retentionDays: 180, action: 'ARCHIVE' as const, scopeFilter: {} },
  { entityName: 'Notification', displayName: 'Notifications', retentionDays: 90, action: 'HARD_DELETE' as const, scopeFilter: {} },
  { entityName: 'AuditLog', displayName: 'Audit Logs', retentionDays: 365, action: 'ARCHIVE' as const, scopeFilter: {} },
  { entityName: 'ErrorLog', displayName: 'Error Logs', retentionDays: 90, action: 'HARD_DELETE' as const, scopeFilter: {} },
  { entityName: 'SyncChangeLog', displayName: 'Sync Change Logs', retentionDays: 30, action: 'HARD_DELETE' as const, scopeFilter: {} },
  { entityName: 'CronJobRunLog', displayName: 'Cron Job Logs', retentionDays: 90, action: 'HARD_DELETE' as const, scopeFilter: {} },
];

@Injectable()
export class SettingsSeederService {
  private readonly logger = new Logger(SettingsSeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Seed ALL default settings for a new tenant. */
  async seedAll(tenantId: string, companyName: string): Promise<void> {
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

  private async seedBranding(tid: string) {
    await this.prisma.tenantBranding.upsert({ where: { tenantId: tid }, update: {}, create: { tenantId: tid } });
  }

  private async seedBusinessHours(tid: string) {
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

  private async seedHolidays(tid: string) {
    const year = new Date().getFullYear();
    for (const h of HOLIDAYS) {
      const [mm, dd] = h.date.split('-');
      await this.prisma.holidayCalendar.create({
        data: {
          tenantId: tid, name: h.name, date: new Date(`${year}-${mm}-${dd}`),
          type: h.type, isRecurring: h.recurring, applicableStates: (h as any).states ?? [],
        },
      });
    }
  }

  private async seedAutoNumbers(tid: string) {
    for (const s of SEED_SEQUENCES) {
      await this.prisma.autoNumberSequence.upsert({
        where: { tenantId_entityName: { tenantId: tid, entityName: s.entityName } },
        update: {},
        create: { tenantId: tid, ...s, startFrom: 1, incrementBy: 1, seqPadding: 5 },
      });
    }
  }

  private async seedCompanyProfile(tid: string, name: string) {
    await this.prisma.companyProfile.upsert({
      where: { tenantId: tid }, update: {},
      create: { tenantId: tid, companyName: name },
    });
  }

  private async seedNotifPrefs(tid: string) {
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

  private async seedSecurityPolicy(tid: string) {
    await this.prisma.securityPolicy.upsert({ where: { tenantId: tid }, update: {}, create: { tenantId: tid } });
  }

  private async seedRetention(tid: string) {
    for (const r of RETENTION_POLICIES) {
      await this.prisma.dataRetentionPolicy.upsert({
        where: { tenantId_entityName: { tenantId: tid, entityName: r.entityName } },
        update: {},
        create: { tenantId: tid, ...r, isEnabled: false },
      });
    }
  }

  private async seedEmailFooter(tid: string, name: string) {
    const existing = await this.prisma.emailFooterTemplate.findFirst({ where: { tenantId: tid } });
    if (existing) return;
    await this.prisma.emailFooterTemplate.create({
      data: {
        tenantId: tid, name: 'Default Footer', isDefault: true,
        bodyHtml: `<div style="padding:20px;text-align:center;color:#666;font-size:12px;border-top:1px solid #eee;margin-top:20px"><p><strong>${name}</strong></p><p>{{companyLogoUrl}}</p><p>This email is confidential and intended for the recipient only.</p><p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p></div>`,
      },
    });
  }
}
