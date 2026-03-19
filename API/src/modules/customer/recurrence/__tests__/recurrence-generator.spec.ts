import { CreateRecurrenceHandler } from '../application/commands/create-recurrence/create-recurrence.handler';
import { CancelRecurrenceHandler } from '../application/commands/cancel-recurrence/cancel-recurrence.handler';
import { RecurrenceGeneratorService } from '../application/services/recurrence-generator.service';
import { NotFoundException } from '@nestjs/common';

describe('Recurrence Handlers', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      recurringEvent: {
        create: jest.fn().mockResolvedValue({ id: 're-1', pattern: 'DAILY', nextOccurrence: new Date() }),
        findUnique: jest.fn().mockResolvedValue({ id: 're-1', isActive: true }),
        findMany: jest.fn().mockResolvedValue([
          { id: 're-1', pattern: 'DAILY', interval: 1, nextOccurrence: new Date(Date.now() - 86400000), occurrenceCount: 0, maxOccurrences: null },
        ]),
        update: jest.fn().mockResolvedValue({ id: 're-1', isActive: false }),
        fields: {},
      },
    };
(prisma as any).working = prisma;
  });

  it('should create a recurring event', async () => {
    const handler = new CreateRecurrenceHandler(prisma);
    const result = await handler.execute({
      entityType: 'ACTIVITY', pattern: 'DAILY', startDate: new Date(),
      createdById: 'user-1', templateData: { subject: 'Daily standup' },
    } as any);
    expect(prisma.recurringEvent.create).toHaveBeenCalled();
    expect(result.id).toBe('re-1');
  });

  it('should cancel a recurring event', async () => {
    const handler = new CancelRecurrenceHandler(prisma);
    await handler.execute({ id: 're-1', userId: 'user-1' });
    expect(prisma.recurringEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
  });

  it('should throw NotFoundException for non-existent event', async () => {
    prisma.recurringEvent.findUnique.mockResolvedValue(null);
    const handler = new CancelRecurrenceHandler(prisma);
    await expect(handler.execute({ id: 'bad', userId: 'u-1' })).rejects.toThrow(NotFoundException);
  });

  it('should generate next occurrence for due events', async () => {
    const service = new RecurrenceGeneratorService(prisma);
    await service.generateOccurrences();
    expect(prisma.recurringEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ occurrenceCount: { increment: 1 } }) }),
    );
  });
});
