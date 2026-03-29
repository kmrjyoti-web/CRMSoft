import { CreateActivityHandler } from '../application/commands/create-activity/create-activity.handler';
import { CompleteActivityHandler } from '../application/commands/complete-activity/complete-activity.handler';
import { DeleteActivityHandler } from '../application/commands/delete-activity/delete-activity.handler';
import { GetActivityByIdHandler } from '../application/queries/get-activity-by-id/get-activity-by-id.handler';
import { GetActivityStatsHandler } from '../application/queries/get-activity-stats/get-activity-stats.handler';
import { NotFoundException } from '@nestjs/common';

describe('Activity Handlers', () => {
  let prisma: any;

  const mockActivity = {
    id: 'act-1', type: 'CALL', subject: 'Follow up call', createdById: 'user-1',
    lead: { id: 'lead-1' }, contact: null, createdByUser: { id: 'user-1', firstName: 'Raj', lastName: 'Patel' },
  };

  beforeEach(() => {
    prisma = {
      activity: {
        create: jest.fn().mockResolvedValue(mockActivity),
        findUnique: jest.fn().mockResolvedValue(mockActivity),
        update: jest.fn().mockResolvedValue({ ...mockActivity, completedAt: new Date() }),
        delete: jest.fn().mockResolvedValue(mockActivity),
        findMany: jest.fn().mockResolvedValue([mockActivity]),
        count: jest.fn().mockResolvedValue(1),
        groupBy: jest.fn().mockResolvedValue([{ type: 'CALL', _count: 1 }]),
      },
      reminder: { create: jest.fn().mockResolvedValue({}) },
      calendarEvent: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
(prisma as any).working = prisma;
  });

  it('should create an activity with reminder and calendar event', async () => {
    const mockChannelRouter = { send: jest.fn().mockResolvedValue({ channels: [] }) };
    const handler = new CreateActivityHandler(prisma, mockChannelRouter as any);
    const result = await handler.execute({
      type: 'CALL', subject: 'Follow up', userId: 'user-1',
      scheduledAt: new Date(Date.now() + 86400000),
    } as any);
    expect(prisma.activity.create).toHaveBeenCalled();
    expect(prisma.calendarEvent.create).toHaveBeenCalled();
    expect(result.id).toBe('act-1');
  });

  it('should complete an activity with outcome', async () => {
    const handler = new CompleteActivityHandler(prisma);
    const result = await handler.execute({ id: 'act-1', userId: 'user-1', outcome: 'Interested' });
    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ outcome: 'Interested' }) }),
    );
  });

  it('should throw NotFoundException for non-existent activity', async () => {
    prisma.activity.findUnique.mockResolvedValue(null);
    const handler = new CompleteActivityHandler(prisma);
    await expect(handler.execute({ id: 'bad-id', userId: 'user-1' })).rejects.toThrow(NotFoundException);
  });

  it('should delete activity and deactivate calendar event', async () => {
    const handler = new DeleteActivityHandler(prisma);
    const result = await handler.execute({ id: 'act-1', userId: 'user-1' });
    expect(prisma.activity.delete).toHaveBeenCalled();
    expect(prisma.calendarEvent.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
    expect(result.deleted).toBe(true);
  });

  it('should get activity by id', async () => {
    const handler = new GetActivityByIdHandler(prisma);
    const result = await handler.execute({ id: 'act-1' });
    expect(result.id).toBe('act-1');
  });

  it('should return activity stats with completion rate', async () => {
    const handler = new GetActivityStatsHandler(prisma);
    const result = await handler.execute({});
    expect(result.total).toBe(1);
    expect(result.byType).toHaveLength(1);
    expect(result.byType[0].type).toBe('CALL');
  });
});
