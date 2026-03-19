import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

/** Default calendar configuration keys and values. */
export const CALENDAR_CONFIG_DEFAULTS: {
  configKey: string;
  value: any;
  description: string;
}[] = [
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

@Injectable()
export class CalendarConfigService {
  private readonly logger = new Logger(CalendarConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get a single config value by key, parsed from JSON. */
  async getConfig(tenantId: string, key: string): Promise<any> {
    const record = await this.prisma.working.calendarConfig.findUnique({
      where: { tenantId_configKey: { tenantId, configKey: key } },
    });
    return record?.configValue ?? null;
  }

  /** Get all calendar configs for a tenant. */
  async getAllConfigs(tenantId: string) {
    return this.prisma.working.calendarConfig.findMany({
      where: { tenantId, isActive: true },
      orderBy: { configKey: 'asc' },
    });
  }

  /** Upsert a single config key. */
  async upsertConfig(
    tenantId: string,
    key: string,
    value: any,
    description?: string,
    updatedById?: string,
  ) {
    return this.prisma.working.calendarConfig.upsert({
      where: { tenantId_configKey: { tenantId, configKey: key } },
      update: { configValue: value, ...(description ? { description } : {}), updatedById },
      create: { tenantId, configKey: key, configValue: value, description, updatedById },
    });
  }

  /** Delete all configs for a tenant and re-seed defaults. */
  async resetToDefaults(tenantId: string, updatedById?: string) {
    await this.prisma.working.calendarConfig.deleteMany({ where: { tenantId } });

    for (const cfg of CALENDAR_CONFIG_DEFAULTS) {
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
    this.logger.log(`Reset ${CALENDAR_CONFIG_DEFAULTS.length} calendar configs to defaults for tenant ${tenantId}`);
  }
}
