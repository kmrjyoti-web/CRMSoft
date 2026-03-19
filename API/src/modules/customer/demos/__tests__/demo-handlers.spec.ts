import { CreateDemoHandler } from '../application/commands/create-demo/create-demo.handler';
import { RescheduleDemoHandler } from '../application/commands/reschedule-demo/reschedule-demo.handler';
import { CompleteDemoHandler } from '../application/commands/complete-demo/complete-demo.handler';
import { CancelDemoHandler } from '../application/commands/cancel-demo/cancel-demo.handler';
import { GetDemoStatsHandler } from '../application/queries/get-demo-stats/get-demo-stats.handler';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('Demo Handlers', () => {
  let prisma: any;

  const mockDemo = {
    id: 'demo-1', mode: 'ONLINE', status: 'SCHEDULED', scheduledAt: new Date(),
    leadId: 'lead-1', conductedById: 'user-1', rescheduleCount: 0,
    lead: { id: 'lead-1', leadNumber: 'L001' }, conductedBy: { id: 'user-1', firstName: 'Raj' },
  };

  beforeEach(() => {
    prisma = {
      demo: {
        create: jest.fn().mockResolvedValue(mockDemo),
        findUnique: jest.fn().mockResolvedValue(mockDemo),
        update: jest.fn().mockResolvedValue({ ...mockDemo, status: 'RESCHEDULED', rescheduleCount: 1 }),
        count: jest.fn().mockResolvedValue(5),
        groupBy: jest.fn().mockResolvedValue([{ status: 'SCHEDULED', _count: 3 }]),
      },
      reminder: { create: jest.fn().mockResolvedValue({}) },
      calendarEvent: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
  });

  it('should create a demo with reminder and calendar event', async () => {
    const handler = new CreateDemoHandler(prisma);
    const result = await handler.execute({
      leadId: 'lead-1', userId: 'user-1', mode: 'ONLINE',
      scheduledAt: new Date(Date.now() + 86400000), duration: 60,
    } as any);
    expect(prisma.demo.create).toHaveBeenCalled();
    expect(prisma.calendarEvent.create).toHaveBeenCalled();
    expect(result.id).toBe('demo-1');
  });

  it('should reschedule a demo and increment count', async () => {
    const handler = new RescheduleDemoHandler(prisma);
    await handler.execute({ id: 'demo-1', userId: 'user-1', scheduledAt: new Date(Date.now() + 172800000) });
    expect(prisma.demo.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'RESCHEDULED', rescheduleCount: { increment: 1 } }) }),
    );
  });

  it('should not reschedule completed demo', async () => {
    prisma.demo.findUnique.mockResolvedValue({ ...mockDemo, status: 'COMPLETED' });
    const handler = new RescheduleDemoHandler(prisma);
    await expect(handler.execute({ id: 'demo-1', userId: 'user-1', scheduledAt: new Date() })).rejects.toThrow(BadRequestException);
  });

  it('should complete a demo with result', async () => {
    prisma.demo.update.mockResolvedValue({ ...mockDemo, status: 'COMPLETED', result: 'INTERESTED' });
    const handler = new CompleteDemoHandler(prisma);
    await handler.execute({ id: 'demo-1', userId: 'user-1', result: 'INTERESTED' });
    expect(prisma.demo.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'COMPLETED', result: 'INTERESTED' }) }),
    );
  });

  it('should cancel a demo as NO_SHOW', async () => {
    const handler = new CancelDemoHandler(prisma);
    prisma.demo.update.mockResolvedValue({ ...mockDemo, status: 'NO_SHOW' });
    await handler.execute({ id: 'demo-1', userId: 'user-1', reason: 'Client absent', isNoShow: true });
    expect(prisma.demo.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'NO_SHOW' }) }),
    );
  });

  it('should return demo stats', async () => {
    const handler = new GetDemoStatsHandler(prisma);
    const result = await handler.execute({});
    expect(result.total).toBe(5);
    expect(result.byStatus).toHaveLength(1);
  });
});
