import { PrismaClient } from '@prisma/client';

export async function seedCalendarEngine(prisma: PrismaClient) {
  // ─── Calendar Configs (7 default keys) ───
  const configs = [
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

  for (const cfg of configs) {
    await prisma.calendarConfig.upsert({
      where: { tenantId_configKey: { tenantId: '', configKey: cfg.configKey } },
      update: { configValue: cfg.value, description: cfg.description },
      create: { tenantId: '', configKey: cfg.configKey, configValue: cfg.value, description: cfg.description },
    });
  }
  console.log(`  ${configs.length} calendar configs`);

  // ─── Cron Job Configs (5 calendar handlers) ───
  const cronJobs = [
    {
      jobCode: 'PROCESS_EVENT_REMINDERS',
      jobName: 'Process Event Reminders',
      moduleName: 'calendar',
      cronExpression: '* * * * *',
      description: 'Check upcoming events and send reminder notifications',
    },
    {
      jobCode: 'SYNC_EXTERNAL_CALENDARS',
      jobName: 'Sync External Calendars',
      moduleName: 'calendar',
      cronExpression: '*/15 * * * *',
      description: 'Sync events with connected Google/Outlook calendars',
    },
    {
      jobCode: 'RENEW_CALENDAR_WEBHOOKS',
      jobName: 'Renew Calendar Webhooks',
      moduleName: 'calendar',
      cronExpression: '0 3 * * *',
      description: 'Renew expiring webhook subscriptions for calendar providers',
    },
    {
      jobCode: 'AUTO_COMPLETE_PAST_EVENTS',
      jobName: 'Auto-Complete Past Events',
      moduleName: 'calendar',
      cronExpression: '*/30 * * * *',
      description: 'Mark past scheduled events as COMPLETED automatically',
    },
    {
      jobCode: 'GENERATE_RECURRING_EVENTS',
      jobName: 'Generate Recurring Events',
      moduleName: 'calendar',
      cronExpression: '0 0 * * *',
      description: 'Generate next 30 days of occurrences for recurring events',
    },
  ];

  for (const job of cronJobs) {
    const existing = await prisma.cronJobConfig.findUnique({ where: { jobCode: job.jobCode } });
    if (!existing) {
      await prisma.cronJobConfig.create({
        data: {
          jobCode: job.jobCode,
          jobName: job.jobName,
          moduleName: job.moduleName,
          cronExpression: job.cronExpression,
          description: job.description,
          timezone: 'Asia/Kolkata',
          status: 'ACTIVE',
        },
      });
    }
  }
  console.log(`  ${cronJobs.length} calendar cron job configs`);
}
