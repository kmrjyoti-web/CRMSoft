// @ts-nocheck
import { CreateRecurrenceHandler } from '../application/commands/create-recurrence/create-recurrence.handler';
import { CancelRecurrenceHandler } from '../application/commands/cancel-recurrence/cancel-recurrence.handler';
import { UpdateRecurrenceHandler } from '../application/commands/update-recurrence/update-recurrence.handler';
import { GetRecurrenceByIdHandler } from '../application/queries/get-recurrence-by-id/get-recurrence-by-id.handler';
import { GetRecurrenceListHandler } from '../application/queries/get-recurrence-list/get-recurrence-list.handler';
import { RecurrenceGeneratorService } from '../application/services/recurrence-generator.service';
import { NotFoundException } from '@nestjs/common';

const makeRecurringEvent = (overrides: any = {}) => ({
  id: 're-1',
  pattern: 'DAILY',
  interval: 1,
  isActive: true,
  occurrenceCount: 0,
  maxOccurrences: null,
  nextOccurrence: new Date(),
  entityType: 'ACTIVITY',
  createdById: 'user-1',
  createdBy: { id: 'user-1', firstName: 'Raj', lastName: 'Patel' },
  ...overrides,
});

describe('Recurrence Handlers', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      recurringEvent: {
        create: jest.fn().mockResolvedValue(makeRecurringEvent()),
        findUnique: jest.fn().mockResolvedValue(makeRecurringEvent()),
        findMany: jest.fn().mockResolvedValue([makeRecurringEvent({ nextOccurrence: new Date(Date.now() - 86400000) })]),
        update: jest.fn().mockResolvedValue(makeRecurringEvent({ isActive: false })),
        count: jest.fn().mockResolvedValue(1),
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

  // ─── UpdateRecurrenceHandler ──────────────────────────────────────────────

  it('should update a recurring event', async () => {
    prisma.recurringEvent.update.mockResolvedValue(makeRecurringEvent({ interval: 2 }));
    const handler = new UpdateRecurrenceHandler(prisma);
    const result = await handler.execute({ id: 're-1', data: { interval: 2 } } as any);
    expect(prisma.recurringEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 're-1' }, data: { interval: 2 } }),
    );
    expect(result.interval).toBe(2);
  });

  it('should throw NotFoundException when updating non-existent event', async () => {
    prisma.recurringEvent.findUnique.mockResolvedValue(null);
    const handler = new UpdateRecurrenceHandler(prisma);
    await expect(handler.execute({ id: 'missing', data: {} } as any)).rejects.toThrow(NotFoundException);
  });

  // ─── GetRecurrenceByIdHandler ─────────────────────────────────────────────

  it('should return recurring event by id with creator', async () => {
    const handler = new GetRecurrenceByIdHandler(prisma);
    const result = await handler.execute({ id: 're-1' } as any);
    expect(prisma.recurringEvent.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 're-1' }, include: expect.objectContaining({ createdBy: expect.anything() }) }),
    );
    expect(result.id).toBe('re-1');
    expect(result.createdBy).toBeDefined();
  });

  it('should throw NotFoundException when event not found by id', async () => {
    prisma.recurringEvent.findUnique.mockResolvedValue(null);
    const handler = new GetRecurrenceByIdHandler(prisma);
    await expect(handler.execute({ id: 'missing' } as any)).rejects.toThrow(NotFoundException);
  });

  // ─── GetRecurrenceListHandler ─────────────────────────────────────────────

  it('should return paginated list of recurring events', async () => {
    prisma.recurringEvent.count.mockResolvedValue(1);
    const handler = new GetRecurrenceListHandler(prisma);
    const result = await handler.execute({ page: 1, limit: 10 } as any);
    expect(prisma.recurringEvent.findMany).toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should filter by createdById when provided', async () => {
    prisma.recurringEvent.count.mockResolvedValue(1);
    const handler = new GetRecurrenceListHandler(prisma);
    await handler.execute({ createdById: 'user-1', page: 1, limit: 10 } as any);
    expect(prisma.recurringEvent.findMany.mock.calls[0][0].where.createdById).toBe('user-1');
  });

  it('should filter active events only', async () => {
    prisma.recurringEvent.count.mockResolvedValue(1);
    const handler = new GetRecurrenceListHandler(prisma);
    await handler.execute({ isActive: true, page: 1, limit: 10 } as any);
    expect(prisma.recurringEvent.findMany.mock.calls[0][0].where.isActive).toBe(true);
  });
});
