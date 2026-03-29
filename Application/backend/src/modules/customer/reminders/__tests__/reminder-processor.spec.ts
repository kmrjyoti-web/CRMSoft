import { ReminderProcessorService } from '../application/services/reminder-processor.service';
import { CreateReminderHandler } from '../application/commands/create-reminder/create-reminder.handler';
import { DismissReminderHandler } from '../application/commands/dismiss-reminder/dismiss-reminder.handler';
import { NotFoundException } from '@nestjs/common';

describe('Reminder Handlers', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      reminder: {
        create: jest.fn().mockResolvedValue({ id: 'rem-1', title: 'Test', channel: 'IN_APP', recipient: { id: 'user-1' } }),
        findUnique: jest.fn().mockResolvedValue({ id: 'rem-1', title: 'Test' }),
        findMany: jest.fn().mockResolvedValue([
          { id: 'rem-1', channel: 'IN_APP', title: 'Test', recipientId: 'user-1', recipient: { id: 'user-1', email: 'test@test.com', firstName: 'Raj' } },
        ]),
        update: jest.fn().mockResolvedValue({ id: 'rem-1', isSent: true }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
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
});
