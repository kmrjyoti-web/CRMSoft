// @ts-nocheck
import { ReminderProcessorService } from '../application/services/reminder-processor.service';
import { CreateReminderHandler } from '../application/commands/create-reminder/create-reminder.handler';
import { DismissReminderHandler } from '../application/commands/dismiss-reminder/dismiss-reminder.handler';
import { AcknowledgeReminderHandler } from '../application/commands/acknowledge-reminder/acknowledge-reminder.handler';
import { CancelReminderHandler } from '../application/commands/cancel-reminder/cancel-reminder.handler';
import { SnoozeReminderHandler } from '../application/commands/snooze-reminder/snooze-reminder.handler';
import { GetReminderListHandler } from '../application/queries/get-reminder-list/get-reminder-list.handler';
import { GetPendingRemindersHandler } from '../application/queries/get-pending-reminders/get-pending-reminders.handler';
import { GetReminderStatsHandler } from '../application/queries/get-reminder-stats/get-reminder-stats.handler';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const makeReminder = (overrides: any = {}) => ({
  id: 'rem-1',
  title: 'Call reminder',
  channel: 'IN_APP',
  status: 'PENDING',
  isActive: true,
  isSent: false,
  recipientId: 'user-1',
  snoozeCount: 0,
  maxSnooze: 3,
  scheduledAt: new Date(Date.now() - 1000),
  recipient: { id: 'user-1', email: 'raj@test.com', firstName: 'Raj' },
  ...overrides,
});

describe('Reminder Handlers', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      reminder: {
        create: jest.fn().mockResolvedValue(makeReminder()),
        findUnique: jest.fn().mockResolvedValue(makeReminder()),
        findMany: jest.fn().mockResolvedValue([makeReminder()]),
        update: jest.fn().mockResolvedValue(makeReminder({ isSent: true })),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        count: jest.fn().mockResolvedValue(5),
        groupBy: jest.fn().mockResolvedValue([{ channel: 'IN_APP', _count: 3 }]),
      },
    };
    (prisma as any).working = prisma;
  });

  it('should create a reminder', async () => {
    const handler = new CreateReminderHandler(prisma);
    const result = await handler.execute({
      title: 'Test', scheduledAt: new Date(), recipientId: 'user-1', createdById: 'user-2',
      entityType: 'LEAD', entityId: 'lead-1',
    } as any);
    expect(prisma.reminder.create).toHaveBeenCalled();
    expect(result.id).toBe('rem-1');
  });

  it('should dismiss a reminder', async () => {
    const handler = new DismissReminderHandler(prisma);
    await handler.execute({ id: 'rem-1', userId: 'user-1' });
    expect(prisma.reminder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isSent: true }) }),
    );
  });

  it('should throw NotFoundException for non-existent reminder', async () => {
    prisma.reminder.findUnique.mockResolvedValue(null);
    const handler = new DismissReminderHandler(prisma);
    await expect(handler.execute({ id: 'bad', userId: 'u-1' })).rejects.toThrow(NotFoundException);
  });

  it('should process due reminders and mark as sent', async () => {
    const service = new ReminderProcessorService(prisma);
    await service.processDueReminders();
    expect(prisma.reminder.findMany).toHaveBeenCalled();
    expect(prisma.reminder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isSent: true }) }),
    );
  });

  // ─── AcknowledgeReminderHandler ───────────────────────────────────────────

  it('should acknowledge a pending reminder', async () => {
    const handler = new AcknowledgeReminderHandler(prisma);
    await handler.execute({ reminderId: 'rem-1', userId: 'user-1' } as any);
    expect(prisma.reminder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ACKNOWLEDGED' }) }),
    );
  });

  it('should throw NotFoundException when acknowledging non-existent reminder', async () => {
    prisma.reminder.findUnique.mockResolvedValue(null);
    const handler = new AcknowledgeReminderHandler(prisma);
    await expect(handler.execute({ reminderId: 'bad', userId: 'user-1' } as any)).rejects.toThrow(NotFoundException);
  });

  it('should throw when acknowledging reminder belonging to another user', async () => {
    prisma.reminder.findUnique.mockResolvedValue(makeReminder({ recipientId: 'other-user' }));
    const handler = new AcknowledgeReminderHandler(prisma);
    await expect(handler.execute({ reminderId: 'rem-1', userId: 'user-1' } as any)).rejects.toThrow(NotFoundException);
  });

  // ─── CancelReminderHandler ────────────────────────────────────────────────

  it('should cancel an active reminder', async () => {
    const handler = new CancelReminderHandler(prisma);
    await handler.execute({ id: 'rem-1' } as any);
    expect(prisma.reminder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'CANCELLED' } }),
    );
  });

  it('should throw NotFoundException when cancelling inactive reminder', async () => {
    prisma.reminder.findUnique.mockResolvedValue(makeReminder({ isActive: false }));
    const handler = new CancelReminderHandler(prisma);
    await expect(handler.execute({ id: 'rem-1' } as any)).rejects.toThrow(NotFoundException);
  });

  // ─── SnoozeReminderHandler ────────────────────────────────────────────────

  it('should snooze a reminder with custom snoozedUntil', async () => {
    const snoozedUntil = new Date(Date.now() + 60 * 60 * 1000);
    prisma.reminder.update.mockResolvedValue(makeReminder({ status: 'SNOOZED', snoozeCount: 1 }));
    const handler = new SnoozeReminderHandler(prisma);
    await handler.execute({ id: 'rem-1', userId: 'user-1', snoozedUntil } as any);
    expect(prisma.reminder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'SNOOZED', snoozedUntil }) }),
    );
  });

  it('should throw BadRequestException when max snooze count reached', async () => {
    prisma.reminder.findUnique.mockResolvedValue(makeReminder({ snoozeCount: 3, maxSnooze: 3 }));
    const handler = new SnoozeReminderHandler(prisma);
    await expect(handler.execute({ id: 'rem-1', userId: 'user-1' } as any)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when snoozing another user reminder', async () => {
    prisma.reminder.findUnique.mockResolvedValue(makeReminder({ recipientId: 'other-user' }));
    const handler = new SnoozeReminderHandler(prisma);
    await expect(handler.execute({ id: 'rem-1', userId: 'user-1' } as any)).rejects.toThrow(BadRequestException);
  });

  // ─── GetReminderListHandler ───────────────────────────────────────────────

  it('should return paginated reminder list', async () => {
    prisma.reminder.count.mockResolvedValue(1);
    const handler = new GetReminderListHandler(prisma);
    const result = await handler.execute({ recipientId: 'user-1', page: 1, limit: 10 } as any);
    expect(prisma.reminder.findMany).toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should filter by channel', async () => {
    prisma.reminder.findMany.mockResolvedValue([]);
    prisma.reminder.count.mockResolvedValue(0);
    const handler = new GetReminderListHandler(prisma);
    await handler.execute({ channel: 'EMAIL', page: 1, limit: 10 } as any);
    expect(prisma.reminder.findMany.mock.calls[0][0].where.channel).toBe('EMAIL');
  });

  // ─── GetPendingRemindersHandler ───────────────────────────────────────────

  it('should return pending reminders due now', async () => {
    prisma.reminder.count.mockResolvedValue(1);
    const handler = new GetPendingRemindersHandler(prisma);
    const result = await handler.execute({ recipientId: 'user-1', page: 1, limit: 10 } as any);
    expect(prisma.reminder.findMany.mock.calls[0][0].where.isSent).toBe(false);
    expect(result.data).toHaveLength(1);
  });

  // ─── GetReminderStatsHandler ──────────────────────────────────────────────

  it('should return reminder stats with sent/pending counts', async () => {
    prisma.reminder.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(3);
    prisma.reminder.groupBy.mockResolvedValue([{ channel: 'IN_APP', _count: 7 }]);
    const handler = new GetReminderStatsHandler(prisma);
    const result = await handler.execute({ userId: 'user-1' } as any);
    expect(result.total).toBe(10);
    expect(result.sent).toBe(7);
    expect(result.pending).toBe(3);
  });
});
