import { PrismaClient } from '@prisma/client';

export async function seedTaskEngine(prisma: PrismaClient) {
  // ─── Task Logic Configs (7 default keys) ───
  const configs = [
    {
      configKey: 'STATUS_TRANSITIONS',
      value: {
        OPEN: ['IN_PROGRESS', 'CANCELLED', 'ON_HOLD'],
        IN_PROGRESS: ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
        ON_HOLD: ['OPEN', 'IN_PROGRESS', 'CANCELLED'],
        OVERDUE: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        COMPLETED: [],
        CANCELLED: [],
      },
      description: 'Valid task status transitions',
    },
    {
      configKey: 'ASSIGNMENT_SCOPE_BY_LEVEL',
      value: { '0': 'ANY_USER', '1': 'ANY_USER', '2': 'REPORTEES', '3': 'REPORTEES', '4': 'SELF', '5': 'SELF', '6': 'SELF' },
      description: 'Task assignment scope by role level',
    },
    {
      configKey: 'OVERDUE_THRESHOLD_HOURS',
      value: 0,
      description: 'Hours after dueDate before marking as OVERDUE (0 = immediately)',
    },
    {
      configKey: 'MAX_SNOOZE_COUNT',
      value: 3,
      description: 'Maximum number of times a reminder can be snoozed',
    },
    {
      configKey: 'SNOOZE_DURATION_MINUTES',
      value: 30,
      description: 'Default snooze duration in minutes',
    },
    {
      configKey: 'ESCALATION_ENABLED',
      value: true,
      description: 'Whether task escalation rules are active',
    },
    {
      configKey: 'AUTO_CREATE_TASK_ON_REMINDER',
      value: true,
      description: 'Automatically create a task when a reminder is set on an activity',
    },
    {
      configKey: 'TASK_ASSIGNMENT_RULES',
      value: {
        allowManagerCrossTeamAssign: false,
        allowUserSelfAssignOnly: true,
        requireDueDateForHighPriority: true,
        autoWatchOnAssign: true,
        autoWatchOnComment: true,
      },
      description: 'Task assignment behavior rules',
    },
    {
      configKey: 'REMINDER_MISSED_THRESHOLD_MINUTES',
      value: { thresholdMinutes: 30, notifyManagerOnMiss: true },
      description: 'Minutes after trigger before marking reminder as MISSED',
    },
    {
      configKey: 'COMMENT_EDIT_WINDOW_MINUTES',
      value: { windowMinutes: 30, adminCanAlwaysEdit: true },
      description: 'How long after posting a comment can it be edited',
    },
    {
      configKey: 'NOTIFICATION_RATE_LIMITS',
      value: {
        email: { perUserPerHour: 20, perTenantPerDay: 5000 },
        whatsapp: { perUserPerHour: 10, perTenantPerDay: 1000 },
        sms: { perUserPerHour: 5, perTenantPerDay: 500 },
        push: { perUserPerHour: 30, perTenantPerDay: 10000 },
        call: { perUserPerHour: 2, perTenantPerDay: 50 },
      },
      description: 'Rate limits per notification channel',
    },
    {
      configKey: 'ESCALATION_DEFAULTS',
      value: {
        level1AfterMinutes: 120,
        level2AfterMinutes: 480,
        level3AfterMinutes: 1440,
        maxEscalationLevel: 3,
      },
      description: 'Default escalation timing',
    },
    {
      configKey: 'TASK_AUTO_OVERDUE_HOURS',
      value: { enabled: true, hoursAfterDue: 0 },
      description: 'Auto-mark tasks as OVERDUE after X hours past due date',
    },
  ];

  for (const cfg of configs) {
    await prisma.taskLogicConfig.upsert({
      where: { tenantId_configKey: { tenantId: '', configKey: cfg.configKey } },
      update: { value: cfg.value, description: cfg.description },
      create: { tenantId: '', configKey: cfg.configKey, value: cfg.value, description: cfg.description },
    });
  }
  console.log(`✅ ${configs.length} task logic configs`);

  // ─── Notification Configs (14 default events) ───
  const notifConfigs = [
    { eventType: 'TASK_ASSIGNED', channels: ['IN_APP', 'EMAIL'] },
    { eventType: 'TASK_COMPLETED', channels: ['IN_APP'] },
    { eventType: 'TASK_OVERDUE', channels: ['IN_APP', 'EMAIL'] },
    { eventType: 'TASK_COMMENT', channels: ['IN_APP'] },
    { eventType: 'REMINDER_DUE', channels: ['IN_APP', 'PUSH'] },
    { eventType: 'REMINDER_MISSED', channels: ['IN_APP', 'EMAIL'] },
    { eventType: 'LEAD_ASSIGNED', channels: ['IN_APP', 'EMAIL'] },
    { eventType: 'LEAD_STATUS_CHANGED', channels: ['IN_APP'] },
    { eventType: 'ACTIVITY_TAGGED', channels: ['IN_APP'] },
    { eventType: 'ACTIVITY_REMINDER', channels: ['IN_APP', 'PUSH'] },
    { eventType: 'COMMENT_ADDED', channels: ['IN_APP'] },
    { eventType: 'COMMENT_PRIVATE', channels: ['IN_APP'] },
    { eventType: 'LEAD_WON', channels: ['IN_APP', 'EMAIL'] },
    { eventType: 'LEAD_LOST', channels: ['IN_APP'] },
    { eventType: 'SYSTEM_ALERT', channels: ['IN_APP'] },
  ];

  for (const nc of notifConfigs) {
    await prisma.notificationConfig.upsert({
      where: { tenantId_eventCode: { tenantId: '', eventCode: nc.eventType } },
      update: { channels: nc.channels },
      create: { tenantId: '', eventCode: nc.eventType, eventType: nc.eventType as any, channels: nc.channels },
    });
  }
  console.log(`✅ ${notifConfigs.length} notification configs`);

  // ─── Notification Templates ───
  const templates = [
    {
      name: 'task_assigned',
      category: 'SYSTEM_ALERT',
      subject: 'Task Assigned: {{taskTitle}}',
      body: '{{assignerName}} assigned you task {{taskNumber}}: {{taskTitle}}. Due: {{dueDate}}',
      variables: ['taskTitle', 'taskNumber', 'assignerName', 'dueDate'],
      channels: ['IN_APP', 'EMAIL'],
    },
    {
      name: 'task_completed',
      category: 'SYSTEM_ALERT',
      subject: 'Task Completed: {{taskTitle}}',
      body: 'Task {{taskNumber}} "{{taskTitle}}" has been completed.',
      variables: ['taskTitle', 'taskNumber'],
      channels: ['IN_APP'],
    },
    {
      name: 'task_overdue',
      category: 'SYSTEM_ALERT',
      subject: 'Overdue: {{taskTitle}}',
      body: 'Task {{taskNumber}} is overdue. It was due on {{dueDate}}. Assigned to: {{assigneeName}}',
      variables: ['taskTitle', 'taskNumber', 'dueDate', 'assigneeName'],
      channels: ['IN_APP', 'EMAIL'],
    },
    {
      name: 'task_comment',
      category: 'SYSTEM_ALERT',
      subject: 'New Comment on {{taskTitle}}',
      body: '{{authorName}} commented on task {{taskNumber}}: "{{commentPreview}}"',
      variables: ['taskTitle', 'taskNumber', 'authorName', 'commentPreview'],
      channels: ['IN_APP'],
    },
    {
      name: 'reminder_due',
      category: 'ACTIVITY_REMINDER',
      subject: 'Reminder: {{reminderTitle}}',
      body: 'Your reminder "{{reminderTitle}}" is due now.',
      variables: ['reminderTitle'],
      channels: ['IN_APP', 'PUSH'],
    },
    {
      name: 'activity_tagged',
      category: 'ACTIVITY_REMINDER',
      subject: 'Tagged in Activity: {{activitySubject}}',
      body: '{{taggerName}} tagged you in activity: {{activitySubject}}',
      variables: ['activitySubject', 'taggerName'],
      channels: ['IN_APP'],
    },
    {
      name: 'comment_added',
      category: 'SYSTEM_ALERT',
      subject: 'New Comment on {{entityType}}',
      body: '{{authorName}} commented: "{{commentPreview}}"',
      variables: ['entityType', 'authorName', 'commentPreview'],
      channels: ['IN_APP'],
    },
  ];

  for (const t of templates) {
    await prisma.notificationTemplate.upsert({
      where: { tenantId_name: { tenantId: '', name: t.name } },
      update: { subject: t.subject, body: t.body, variables: t.variables, channels: t.channels },
      create: {
        tenantId: '',
        name: t.name,
        category: t.category as any,
        subject: t.subject,
        body: t.body,
        variables: t.variables,
        channels: t.channels,
      },
    });
  }
  console.log(`✅ ${templates.length} notification templates`);

  // ─── Default Escalation Rule ───
  const existingRule = await prisma.escalationRule.findFirst({
    where: { tenantId: '', entityType: 'task' },
  });
  if (!existingRule) {
    await prisma.escalationRule.create({
      data: {
        tenantId: '',
        entityType: 'task',
        triggerAfterHours: 24,
        action: 'NOTIFY_MANAGER',
      },
    });
    console.log('✅ 1 default escalation rule');
  }

  // ─── CronJobConfig seeds for new handlers ───
  const cronJobs = [
    { jobCode: 'CHECK_OVERDUE_TASKS', jobName: 'Check Overdue Tasks', moduleName: 'task-engine', cronExpression: '*/15 * * * *', description: 'Mark tasks as OVERDUE when dueDate passed' },
    { jobCode: 'CHECK_TASK_ESCALATIONS', jobName: 'Check Task Escalations', moduleName: 'task-engine', cronExpression: '0 * * * *', description: 'Run escalation rules for overdue tasks' },
    { jobCode: 'PROCESS_TASK_RECURRENCE', jobName: 'Process Task Recurrence', moduleName: 'task-engine', cronExpression: '0 6 * * *', description: 'Generate next occurrence for recurring tasks' },
    { jobCode: 'CHECK_MISSED_REMINDERS', jobName: 'Check Missed Reminders', moduleName: 'task-engine', cronExpression: '*/30 * * * *', description: 'Mark PENDING reminders > 1h past scheduledAt as MISSED' },
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
  console.log(`✅ ${cronJobs.length} cron job configs`);
}
