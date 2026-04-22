/**
 * Notification Handlers — comprehensive unit tests
 * Covers all 17 handlers (11 commands + 6 queries)
 * Uses direct instantiation, no NestJS Test.createTestingModule
 */

import { NotFoundException, ConflictException } from '@nestjs/common';

// ─── Command Handlers ────────────────────────────────────────────────────────
import { BulkDismissHandler } from '../application/commands/bulk-dismiss/bulk-dismiss.handler';
import { BulkDismissCommand } from '../application/commands/bulk-dismiss/bulk-dismiss.command';
import { BulkMarkReadHandler } from '../application/commands/bulk-mark-read/bulk-mark-read.handler';
import { BulkMarkReadCommand } from '../application/commands/bulk-mark-read/bulk-mark-read.command';
import { CreateTemplateHandler } from '../application/commands/create-template/create-template.handler';
import { CreateTemplateCommand } from '../application/commands/create-template/create-template.command';
import { DismissNotificationHandler } from '../application/commands/dismiss-notification/dismiss-notification.handler';
import { DismissNotificationCommand } from '../application/commands/dismiss-notification/dismiss-notification.command';
import { MarkAllReadHandler } from '../application/commands/mark-all-read/mark-all-read.handler';
import { MarkAllReadCommand } from '../application/commands/mark-all-read/mark-all-read.command';
import { MarkReadHandler } from '../application/commands/mark-read/mark-read.handler';
import { MarkReadCommand } from '../application/commands/mark-read/mark-read.command';
import { RegisterPushHandler } from '../application/commands/register-push/register-push.handler';
import { RegisterPushCommand } from '../application/commands/register-push/register-push.command';
import { SendNotificationHandler } from '../application/commands/send-notification/send-notification.handler';
import { SendNotificationCommand } from '../application/commands/send-notification/send-notification.command';
import { UnregisterPushHandler } from '../application/commands/unregister-push/unregister-push.handler';
import { UnregisterPushCommand } from '../application/commands/unregister-push/unregister-push.command';
import { UpdatePreferencesHandler } from '../application/commands/update-preferences/update-preferences.handler';
import { UpdatePreferencesCommand } from '../application/commands/update-preferences/update-preferences.command';
import { UpdateTemplateHandler } from '../application/commands/update-template/update-template.handler';
import { UpdateTemplateCommand } from '../application/commands/update-template/update-template.command';

// ─── Query Handlers ───────────────────────────────────────────────────────────
import { GetNotificationByIdHandler } from '../application/queries/get-notification-by-id/get-notification-by-id.handler';
import { GetNotificationByIdQuery } from '../application/queries/get-notification-by-id/get-notification-by-id.query';
import { GetNotificationStatsHandler } from '../application/queries/get-notification-stats/get-notification-stats.handler';
import { GetNotificationStatsQuery } from '../application/queries/get-notification-stats/get-notification-stats.query';
import { GetNotificationsHandler } from '../application/queries/get-notifications/get-notifications.handler';
import { GetNotificationsQuery } from '../application/queries/get-notifications/get-notifications.query';
import { GetPreferencesHandler } from '../application/queries/get-preferences/get-preferences.handler';
import { GetPreferencesQuery } from '../application/queries/get-preferences/get-preferences.query';
import { GetTemplatesHandler } from '../application/queries/get-templates/get-templates.handler';
import { GetTemplatesQuery } from '../application/queries/get-templates/get-templates.query';
import { GetUnreadCountHandler } from '../application/queries/get-unread-count/get-unread-count.handler';
import { GetUnreadCountQuery } from '../application/queries/get-unread-count/get-unread-count.query';

// ─── Services (direct, for service-based handlers) ───────────────────────────
import { NotificationCoreService } from '../services/notification-core.service';
import { NotificationTemplateService } from '../services/template.service';
import { PreferenceService } from '../services/preference.service';
import { ChannelRouterService } from '../services/channel-router.service';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const NOTIFICATION = {
  id: 'notif-1',
  recipientId: 'user-1',
  title: 'Test Notification',
  message: 'Hello user',
  category: 'GENERAL',
  status: 'UNREAD',
  priority: 'MEDIUM',
  isActive: true,
  groupKey: null,
  groupCount: 1,
  isGrouped: false,
  createdAt: new Date(),
};

const TEMPLATE = {
  id: 'tmpl-1',
  name: 'welcome',
  category: 'GENERAL',
  subject: 'Welcome {{name}}',
  body: 'Hi {{name}}, welcome!',
  channels: ['IN_APP', 'EMAIL'],
  variables: ['name'],
  isActive: true,
};

const PREFERENCE = {
  id: 'pref-1',
  userId: 'user-1',
  channels: { enabled: ['IN_APP', 'EMAIL'] },
  categories: {},
  digestFrequency: 'REALTIME',
  timezone: 'Asia/Kolkata',
  quietHoursStart: null,
  quietHoursEnd: null,
};

const PUSH_SUB = {
  id: 'push-1',
  userId: 'user-1',
  endpoint: 'https://push.example.com/sub',
  isActive: true,
};

// ─── Prisma mock factory ──────────────────────────────────────────────────────

const makePrisma = () => ({
  notification: {
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([NOTIFICATION]),
    create: jest.fn().mockResolvedValue(NOTIFICATION),
    update: jest.fn().mockResolvedValue(NOTIFICATION),
    updateMany: jest.fn().mockResolvedValue({ count: 2 }),
    count: jest.fn().mockResolvedValue(5),
    groupBy: jest.fn().mockResolvedValue([]),
  },
  notificationTemplate: {
    findFirst: jest.fn().mockResolvedValue(TEMPLATE),
    findUnique: jest.fn().mockResolvedValue(TEMPLATE),
    create: jest.fn().mockResolvedValue(TEMPLATE),
    update: jest.fn().mockResolvedValue(TEMPLATE),
    findMany: jest.fn().mockResolvedValue([TEMPLATE]),
  },
  notificationPreference: {
    findUnique: jest.fn().mockResolvedValue(PREFERENCE),
    create: jest.fn().mockResolvedValue(PREFERENCE),
    upsert: jest.fn().mockResolvedValue(PREFERENCE),
  },
  pushSubscription: {
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    create: jest.fn().mockResolvedValue(PUSH_SUB),
    findMany: jest.fn().mockResolvedValue([PUSH_SUB]),
  },
});

// ─── BulkDismissHandler ───────────────────────────────────────────────────────

describe('BulkDismissHandler', () => {
  let handler: BulkDismissHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const coreService = new NotificationCoreService(mockPrisma as any);
    handler = new BulkDismissHandler(coreService);
  });

  it('bulk dismisses notifications for a user', async () => {
    mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });

    const result = await handler.execute(
      new BulkDismissCommand(['notif-1', 'notif-2', 'notif-3'], 'user-1'),
    );

    expect(result).toEqual({ dismissed: 3 });
    expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ recipientId: 'user-1', isActive: true }),
        data: expect.objectContaining({ status: 'DISMISSED' }),
      }),
    );
  });

  it('filters by tenantId (recipientId isolation)', async () => {
    await handler.execute(new BulkDismissCommand(['notif-1'], 'user-1'));

    const callArg = mockPrisma.notification.updateMany.mock.calls[0][0];
    expect(callArg.where.recipientId).toBe('user-1');
    expect(callArg.where.id.in).toEqual(['notif-1']);
  });

  it('handles Prisma error and rethrows', async () => {
    mockPrisma.notification.updateMany.mockRejectedValue(new Error('DB error'));

    await expect(
      handler.execute(new BulkDismissCommand(['notif-1'], 'user-1')),
    ).rejects.toThrow('DB error');
  });
});

// ─── BulkMarkReadHandler ──────────────────────────────────────────────────────

describe('BulkMarkReadHandler', () => {
  let handler: BulkMarkReadHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const coreService = new NotificationCoreService(mockPrisma as any);
    handler = new BulkMarkReadHandler(coreService);
  });

  it('marks multiple notifications as read', async () => {
    mockPrisma.notification.updateMany.mockResolvedValue({ count: 2 });

    const result = await handler.execute(
      new BulkMarkReadCommand(['notif-1', 'notif-2'], 'user-1'),
    );

    expect(result).toEqual({ updated: 2 });
    expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ recipientId: 'user-1', id: { in: ['notif-1', 'notif-2'] } }),
        data: expect.objectContaining({ status: 'READ' }),
      }),
    );
  });

  it('tenant isolation: only marks notifications belonging to the user', async () => {
    await handler.execute(new BulkMarkReadCommand(['notif-x'], 'user-2'));

    const callArg = mockPrisma.notification.updateMany.mock.calls[0][0];
    expect(callArg.where.recipientId).toBe('user-2');
  });

  it('rethrows on DB error', async () => {
    mockPrisma.notification.updateMany.mockRejectedValue(new Error('Connection lost'));

    await expect(
      handler.execute(new BulkMarkReadCommand(['notif-1'], 'user-1')),
    ).rejects.toThrow('Connection lost');
  });
});

// ─── CreateTemplateHandler ────────────────────────────────────────────────────

describe('CreateTemplateHandler', () => {
  let handler: CreateTemplateHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const templateService = new NotificationTemplateService(mockPrisma as any);
    handler = new CreateTemplateHandler(templateService);
  });

  it('creates a notification template', async () => {
    mockPrisma.notificationTemplate.findFirst.mockResolvedValue(null); // no existing
    mockPrisma.notificationTemplate.create.mockResolvedValue(TEMPLATE);

    const result = await handler.execute(
      new CreateTemplateCommand('welcome', 'GENERAL', 'Welcome {{name}}', 'Hi {{name}}!', ['IN_APP'], ['name']),
    );

    expect(result.name).toBe('welcome');
    expect(mockPrisma.notificationTemplate.create).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictException when template name already exists', async () => {
    mockPrisma.notificationTemplate.findFirst.mockResolvedValue(TEMPLATE); // already exists

    await expect(
      handler.execute(new CreateTemplateCommand('welcome', 'GENERAL', 'subj', 'body')),
    ).rejects.toThrow(ConflictException);
  });

  it('defaults channels to IN_APP when not provided', async () => {
    mockPrisma.notificationTemplate.findFirst.mockResolvedValue(null);
    mockPrisma.notificationTemplate.create.mockResolvedValue({ ...TEMPLATE, channels: ['IN_APP'] });

    await handler.execute(new CreateTemplateCommand('onboard', 'GENERAL', 'subj', 'body'));

    expect(mockPrisma.notificationTemplate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ channels: ['IN_APP'] }),
      }),
    );
  });

  it('rethrows DB errors', async () => {
    mockPrisma.notificationTemplate.findFirst.mockRejectedValue(new Error('DB fail'));

    await expect(
      handler.execute(new CreateTemplateCommand('fail', 'GENERAL', 'subj', 'body')),
    ).rejects.toThrow('DB fail');
  });
});

// ─── DismissNotificationHandler ───────────────────────────────────────────────

describe('DismissNotificationHandler', () => {
  let handler: DismissNotificationHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const coreService = new NotificationCoreService(mockPrisma as any);
    handler = new DismissNotificationHandler(coreService);
  });

  it('dismisses a notification', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(NOTIFICATION);
    mockPrisma.notification.update.mockResolvedValue({ ...NOTIFICATION, status: 'DISMISSED' });

    const result = await handler.execute(new DismissNotificationCommand('notif-1', 'user-1'));

    expect(result.status).toBe('DISMISSED');
    expect(mockPrisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'notif-1' },
        data: expect.objectContaining({ status: 'DISMISSED' }),
      }),
    );
  });

  it('throws NotFoundException when notification not found', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(null);

    await expect(
      handler.execute(new DismissNotificationCommand('bad-id', 'user-1')),
    ).rejects.toThrow(NotFoundException);
  });

  it('tenant isolation: findFirst uses recipientId', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(null);

    await expect(
      handler.execute(new DismissNotificationCommand('notif-1', 'other-user')),
    ).rejects.toThrow(NotFoundException);

    expect(mockPrisma.notification.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ recipientId: 'other-user' }),
      }),
    );
  });
});

// ─── MarkAllReadHandler ───────────────────────────────────────────────────────

describe('MarkAllReadHandler', () => {
  let handler: MarkAllReadHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const coreService = new NotificationCoreService(mockPrisma as any);
    handler = new MarkAllReadHandler(coreService);
  });

  it('marks all notifications read for a user', async () => {
    mockPrisma.notification.updateMany.mockResolvedValue({ count: 10 });

    const result = await handler.execute(new MarkAllReadCommand('user-1'));

    expect(result).toEqual({ updated: 10 });
    expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ recipientId: 'user-1', status: 'UNREAD' }),
        data: expect.objectContaining({ status: 'READ' }),
      }),
    );
  });

  it('filters by category when provided', async () => {
    mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });

    await handler.execute(new MarkAllReadCommand('user-1', 'SYSTEM'));

    const callArg = mockPrisma.notification.updateMany.mock.calls[0][0];
    expect(callArg.where.category).toBe('SYSTEM');
  });

  it('does not filter by category when not provided', async () => {
    mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

    await handler.execute(new MarkAllReadCommand('user-1'));

    const callArg = mockPrisma.notification.updateMany.mock.calls[0][0];
    expect(callArg.where.category).toBeUndefined();
  });

  it('rethrows on DB error', async () => {
    mockPrisma.notification.updateMany.mockRejectedValue(new Error('DB down'));

    await expect(handler.execute(new MarkAllReadCommand('user-1'))).rejects.toThrow('DB down');
  });
});

// ─── MarkReadHandler ──────────────────────────────────────────────────────────

describe('MarkReadHandler', () => {
  let handler: MarkReadHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const coreService = new NotificationCoreService(mockPrisma as any);
    handler = new MarkReadHandler(coreService);
  });

  it('marks a single notification as read', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(NOTIFICATION);
    mockPrisma.notification.update.mockResolvedValue({ ...NOTIFICATION, status: 'READ' });

    const result = await handler.execute(new MarkReadCommand('notif-1', 'user-1'));

    expect(result.status).toBe('READ');
    expect(mockPrisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'notif-1' } }),
    );
  });

  it('throws NotFoundException when notification not found', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(null);

    await expect(
      handler.execute(new MarkReadCommand('missing', 'user-1')),
    ).rejects.toThrow(NotFoundException);
  });

  it('tenant isolation: only allows reading own notifications', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(null);

    await expect(handler.execute(new MarkReadCommand('notif-1', 'wrong-user'))).rejects.toThrow(
      NotFoundException,
    );

    expect(mockPrisma.notification.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'notif-1', recipientId: 'wrong-user' }),
      }),
    );
  });
});

// ─── RegisterPushHandler ──────────────────────────────────────────────────────

describe('RegisterPushHandler', () => {
  let handler: RegisterPushHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const preferenceService = new PreferenceService(mockPrisma as any);
    handler = new RegisterPushHandler(preferenceService);
  });

  it('registers a push subscription', async () => {
    mockPrisma.pushSubscription.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.pushSubscription.create.mockResolvedValue(PUSH_SUB);

    const result = await handler.execute(
      new RegisterPushCommand('user-1', 'https://push.example.com/sub', 'p256dh-key', 'auth-key', 'WEB'),
    );

    expect(result.id).toBe('push-1');
    expect(result.userId).toBe('user-1');
    expect(mockPrisma.pushSubscription.create).toHaveBeenCalledTimes(1);
  });

  it('deactivates old subscription for same endpoint before creating new', async () => {
    mockPrisma.pushSubscription.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.pushSubscription.create.mockResolvedValue(PUSH_SUB);

    await handler.execute(
      new RegisterPushCommand('user-1', 'https://push.example.com/sub'),
    );

    expect(mockPrisma.pushSubscription.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', endpoint: 'https://push.example.com/sub' },
        data: { isActive: false },
      }),
    );
  });

  it('rethrows on DB error', async () => {
    mockPrisma.pushSubscription.updateMany.mockRejectedValue(new Error('DB error'));

    await expect(
      handler.execute(new RegisterPushCommand('user-1', 'https://push.example.com/sub')),
    ).rejects.toThrow('DB error');
  });
});

// ─── SendNotificationHandler ──────────────────────────────────────────────────

describe('SendNotificationHandler', () => {
  let handler: SendNotificationHandler;
  let mockChannelRouter: { send: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockChannelRouter = {
      send: jest.fn().mockResolvedValue({
        channels: [{ channel: 'IN_APP', success: true }],
        template: 'welcome',
      }),
    };
    handler = new SendNotificationHandler(mockChannelRouter as any);
  });

  it('routes notification through channel router', async () => {
    const result = await handler.execute(
      new SendNotificationCommand('welcome', 'user-1', { name: 'Ravi' }, 'admin-1'),
    );

    expect(result.template).toBe('welcome');
    expect(result.channels).toHaveLength(1);
    expect(mockChannelRouter.send).toHaveBeenCalledWith(
      expect.objectContaining({
        templateName: 'welcome',
        recipientId: 'user-1',
        variables: { name: 'Ravi' },
      }),
    );
  });

  it('passes all optional params to channel router', async () => {
    await handler.execute(
      new SendNotificationCommand(
        'welcome',
        'user-1',
        { name: 'Ravi' },
        'admin-1',
        'LEAD',
        'lead-123',
        'HIGH',
        'grp-key',
        ['IN_APP'],
      ),
    );

    expect(mockChannelRouter.send).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'LEAD',
        entityId: 'lead-123',
        priority: 'HIGH',
        groupKey: 'grp-key',
        channelOverrides: ['IN_APP'],
      }),
    );
  });

  it('rethrows when channel router fails', async () => {
    mockChannelRouter.send.mockRejectedValue(new Error('Template not found'));

    await expect(
      handler.execute(new SendNotificationCommand('missing', 'user-1', {})),
    ).rejects.toThrow('Template not found');
  });
});

// ─── UnregisterPushHandler ────────────────────────────────────────────────────

describe('UnregisterPushHandler', () => {
  let handler: UnregisterPushHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const preferenceService = new PreferenceService(mockPrisma as any);
    handler = new UnregisterPushHandler(preferenceService);
  });

  it('unregisters a push subscription', async () => {
    mockPrisma.pushSubscription.updateMany.mockResolvedValue({ count: 1 });

    const result = await handler.execute(
      new UnregisterPushCommand('user-1', 'https://push.example.com/sub'),
    );

    expect(result).toEqual({ unregistered: 1 });
    expect(mockPrisma.pushSubscription.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', endpoint: 'https://push.example.com/sub', isActive: true },
        data: { isActive: false },
      }),
    );
  });

  it('throws NotFoundException when no active subscription found', async () => {
    mockPrisma.pushSubscription.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      handler.execute(new UnregisterPushCommand('user-1', 'https://nonexistent.com')),
    ).rejects.toThrow(NotFoundException);
  });

  it('rethrows DB errors', async () => {
    mockPrisma.pushSubscription.updateMany.mockRejectedValue(new Error('DB error'));

    await expect(
      handler.execute(new UnregisterPushCommand('user-1', 'https://push.example.com/sub')),
    ).rejects.toThrow('DB error');
  });
});

// ─── UpdatePreferencesHandler ─────────────────────────────────────────────────

describe('UpdatePreferencesHandler', () => {
  let handler: UpdatePreferencesHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const preferenceService = new PreferenceService(mockPrisma as any);
    handler = new UpdatePreferencesHandler(preferenceService);
  });

  it('updates user notification preferences', async () => {
    const updated = { ...PREFERENCE, digestFrequency: 'DAILY', timezone: 'UTC' };
    mockPrisma.notificationPreference.upsert.mockResolvedValue(updated);

    const result = await handler.execute(
      new UpdatePreferencesCommand('user-1', { enabled: ['IN_APP'] }, {}, '22:00', '07:00', 'DAILY', 'UTC'),
    );

    expect(result.digestFrequency).toBe('DAILY');
    expect(mockPrisma.notificationPreference.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
  });

  it('uses upsert (creates if not existing)', async () => {
    mockPrisma.notificationPreference.upsert.mockResolvedValue(PREFERENCE);

    await handler.execute(new UpdatePreferencesCommand('new-user'));

    expect(mockPrisma.notificationPreference.upsert).toHaveBeenCalledTimes(1);
  });

  it('rethrows on DB error', async () => {
    mockPrisma.notificationPreference.upsert.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new UpdatePreferencesCommand('user-1'))).rejects.toThrow('DB error');
  });
});

// ─── UpdateTemplateHandler ────────────────────────────────────────────────────

describe('UpdateTemplateHandler', () => {
  let handler: UpdateTemplateHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const templateService = new NotificationTemplateService(mockPrisma as any);
    handler = new UpdateTemplateHandler(templateService);
  });

  it('updates an existing template', async () => {
    mockPrisma.notificationTemplate.findUnique.mockResolvedValue(TEMPLATE);
    const updated = { ...TEMPLATE, subject: 'New Subject' };
    mockPrisma.notificationTemplate.update.mockResolvedValue(updated);

    const result = await handler.execute(new UpdateTemplateCommand('tmpl-1', 'New Subject'));

    expect(result.subject).toBe('New Subject');
    expect(mockPrisma.notificationTemplate.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'tmpl-1' } }),
    );
  });

  it('throws NotFoundException when template does not exist', async () => {
    mockPrisma.notificationTemplate.findUnique.mockResolvedValue(null);

    await expect(
      handler.execute(new UpdateTemplateCommand('missing-id', 'New Subject')),
    ).rejects.toThrow(NotFoundException);
  });

  it('only passes defined fields to update', async () => {
    mockPrisma.notificationTemplate.findUnique.mockResolvedValue(TEMPLATE);
    mockPrisma.notificationTemplate.update.mockResolvedValue({ ...TEMPLATE, isActive: false });

    await handler.execute(new UpdateTemplateCommand('tmpl-1', undefined, undefined, undefined, undefined, false));

    const callArg = mockPrisma.notificationTemplate.update.mock.calls[0][0];
    expect(callArg.data).toHaveProperty('isActive', false);
    expect(callArg.data).not.toHaveProperty('subject');
  });

  it('rethrows DB errors', async () => {
    mockPrisma.notificationTemplate.findUnique.mockRejectedValue(new Error('DB error'));

    await expect(
      handler.execute(new UpdateTemplateCommand('tmpl-1', 'Subject')),
    ).rejects.toThrow('DB error');
  });
});

// ─── GetNotificationByIdHandler ───────────────────────────────────────────────

describe('GetNotificationByIdHandler', () => {
  let handler: GetNotificationByIdHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const coreService = new NotificationCoreService(mockPrisma as any);
    handler = new GetNotificationByIdHandler(coreService);
  });

  it('returns a notification by id', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(NOTIFICATION);

    const result = await handler.execute(new GetNotificationByIdQuery('notif-1', 'user-1'));

    expect(result.id).toBe('notif-1');
    expect(mockPrisma.notification.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'notif-1', recipientId: 'user-1' }),
      }),
    );
  });

  it('throws NotFoundException when notification not found', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(null);

    await expect(
      handler.execute(new GetNotificationByIdQuery('bad-id', 'user-1')),
    ).rejects.toThrow(NotFoundException);
  });

  it('tenant isolation: only returns notifications for the requesting user', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(null);

    await expect(
      handler.execute(new GetNotificationByIdQuery('notif-1', 'other-user')),
    ).rejects.toThrow(NotFoundException);

    const callArg = mockPrisma.notification.findFirst.mock.calls[0][0];
    expect(callArg.where.recipientId).toBe('other-user');
  });
});

// ─── GetNotificationStatsHandler ──────────────────────────────────────────────

describe('GetNotificationStatsHandler', () => {
  let handler: GetNotificationStatsHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const coreService = new NotificationCoreService(mockPrisma as any);
    handler = new GetNotificationStatsHandler(coreService);
  });

  it('returns stats for a user', async () => {
    mockPrisma.notification.count
      .mockResolvedValueOnce(20)  // total
      .mockResolvedValueOnce(5)   // unread
      .mockResolvedValueOnce(12)  // read
      .mockResolvedValueOnce(3);  // dismissed
    mockPrisma.notification.groupBy
      .mockResolvedValueOnce([{ category: 'GENERAL', _count: 10 }])
      .mockResolvedValueOnce([{ priority: 'HIGH', _count: 3 }]);

    const result = await handler.execute(new GetNotificationStatsQuery('user-1'));

    expect(result.total).toBe(20);
    expect(result.unread).toBe(5);
    expect(result.read).toBe(12);
    expect(result.dismissed).toBe(3);
    expect(result.byCategory).toHaveLength(1);
    expect(result.byPriority).toHaveLength(1);
  });

  it('filters stats by userId', async () => {
    mockPrisma.notification.count.mockResolvedValue(0);
    mockPrisma.notification.groupBy.mockResolvedValue([]);

    await handler.execute(new GetNotificationStatsQuery('user-2'));

    expect(mockPrisma.notification.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ recipientId: 'user-2' }) }),
    );
  });

  it('rethrows on DB error', async () => {
    mockPrisma.notification.count.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new GetNotificationStatsQuery('user-1'))).rejects.toThrow('DB error');
  });
});

// ─── GetNotificationsHandler ──────────────────────────────────────────────────

describe('GetNotificationsHandler', () => {
  let handler: GetNotificationsHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const coreService = new NotificationCoreService(mockPrisma as any);
    handler = new GetNotificationsHandler(coreService);
  });

  it('returns paginated notifications for a user', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([NOTIFICATION]);
    mockPrisma.notification.count.mockResolvedValue(1);

    const result = await handler.execute(new GetNotificationsQuery('user-1', 1, 20));

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('applies category and status filters', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([]);
    mockPrisma.notification.count.mockResolvedValue(0);

    await handler.execute(new GetNotificationsQuery('user-1', 1, 10, 'SYSTEM', 'UNREAD', 'HIGH'));

    expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'SYSTEM', status: 'UNREAD', priority: 'HIGH' }),
      }),
    );
  });

  it('tenant isolation: filters by recipientId', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([]);
    mockPrisma.notification.count.mockResolvedValue(0);

    await handler.execute(new GetNotificationsQuery('user-42'));

    expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ recipientId: 'user-42' }),
      }),
    );
  });

  it('rethrows on DB error', async () => {
    mockPrisma.notification.findMany.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new GetNotificationsQuery('user-1'))).rejects.toThrow('DB error');
  });
});

// ─── GetPreferencesHandler ────────────────────────────────────────────────────

describe('GetPreferencesHandler', () => {
  let handler: GetPreferencesHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const preferenceService = new PreferenceService(mockPrisma as any);
    handler = new GetPreferencesHandler(preferenceService);
  });

  it('returns existing preferences', async () => {
    mockPrisma.notificationPreference.findUnique.mockResolvedValue(PREFERENCE);

    const result = await handler.execute(new GetPreferencesQuery('user-1'));

    expect(result.userId).toBe('user-1');
    expect(result.timezone).toBe('Asia/Kolkata');
  });

  it('creates default preferences when none exist', async () => {
    mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);
    mockPrisma.notificationPreference.create.mockResolvedValue(PREFERENCE);

    const result = await handler.execute(new GetPreferencesQuery('new-user'));

    expect(result).toBeDefined();
    expect(mockPrisma.notificationPreference.create).toHaveBeenCalledTimes(1);
  });

  it('rethrows on DB error', async () => {
    mockPrisma.notificationPreference.findUnique.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new GetPreferencesQuery('user-1'))).rejects.toThrow('DB error');
  });
});

// ─── GetTemplatesHandler ──────────────────────────────────────────────────────

describe('GetTemplatesHandler', () => {
  let handler: GetTemplatesHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const templateService = new NotificationTemplateService(mockPrisma as any);
    handler = new GetTemplatesHandler(templateService);
  });

  it('returns all templates', async () => {
    mockPrisma.notificationTemplate.findMany.mockResolvedValue([TEMPLATE]);

    const result = await handler.execute(new GetTemplatesQuery());

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('welcome');
  });

  it('filters by category and isActive', async () => {
    mockPrisma.notificationTemplate.findMany.mockResolvedValue([TEMPLATE]);

    await handler.execute(new GetTemplatesQuery('GENERAL', true));

    expect(mockPrisma.notificationTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'GENERAL', isActive: true }),
      }),
    );
  });

  it('rethrows on DB error', async () => {
    mockPrisma.notificationTemplate.findMany.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new GetTemplatesQuery())).rejects.toThrow('DB error');
  });
});

// ─── GetUnreadCountHandler ────────────────────────────────────────────────────

describe('GetUnreadCountHandler', () => {
  let handler: GetUnreadCountHandler;
  let mockPrisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = makePrisma();
    const coreService = new NotificationCoreService(mockPrisma as any);
    handler = new GetUnreadCountHandler(coreService);
  });

  it('returns total unread count and breakdown by category', async () => {
    mockPrisma.notification.count.mockResolvedValue(7);
    mockPrisma.notification.groupBy.mockResolvedValue([
      { category: 'GENERAL', _count: 4 },
      { category: 'SYSTEM', _count: 3 },
    ]);

    const result = await handler.execute(new GetUnreadCountQuery('user-1'));

    expect(result.total).toBe(7);
    expect(result.byCategory).toEqual({ GENERAL: 4, SYSTEM: 3 });
  });

  it('tenant isolation: filters by recipientId', async () => {
    mockPrisma.notification.count.mockResolvedValue(0);
    mockPrisma.notification.groupBy.mockResolvedValue([]);

    await handler.execute(new GetUnreadCountQuery('user-99'));

    expect(mockPrisma.notification.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ recipientId: 'user-99', status: 'UNREAD' }),
      }),
    );
  });

  it('rethrows on DB error', async () => {
    mockPrisma.notification.count.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new GetUnreadCountQuery('user-1'))).rejects.toThrow('DB error');
  });
});
