// @ts-nocheck
import { NotFoundException, BadRequestException } from '@nestjs/common';

// ─── Shared fixtures ─────────────────────────────────────────────────────────
const makeDemo = (overrides: any = {}) => ({
  id: 'demo-1',
  mode: 'ONLINE',
  status: 'SCHEDULED',
  scheduledAt: new Date('2025-06-01T10:00:00Z'),
  duration: 60,
  leadId: 'lead-1',
  conductedById: 'user-1',
  rescheduleCount: 0,
  notes: 'Initial notes',
  lead: { id: 'lead-1', leadNumber: 'L001', status: 'NEW' },
  conductedBy: { id: 'user-1', firstName: 'Raj', lastName: 'Patel', email: 'raj@test.com' },
  ...overrides,
});

const makePrisma = () => {
  const p: any = {
    demo: {
      findUnique: jest.fn().mockResolvedValue(makeDemo()),
      findMany: jest.fn().mockResolvedValue([makeDemo()]),
      create: jest.fn().mockResolvedValue(makeDemo()),
      update: jest.fn().mockResolvedValue(makeDemo()),
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
  p.working = p;
  return p;
};

// ─── Imports ─────────────────────────────────────────────────────────────────
import { CreateDemoHandler } from '../application/commands/create-demo/create-demo.handler';
import { CreateDemoCommand } from '../application/commands/create-demo/create-demo.command';
import { CancelDemoHandler } from '../application/commands/cancel-demo/cancel-demo.handler';
import { CancelDemoCommand } from '../application/commands/cancel-demo/cancel-demo.command';
import { CompleteDemoHandler } from '../application/commands/complete-demo/complete-demo.handler';
import { CompleteDemoCommand } from '../application/commands/complete-demo/complete-demo.command';
import { RescheduleDemoHandler } from '../application/commands/reschedule-demo/reschedule-demo.handler';
import { RescheduleDemoCommand } from '../application/commands/reschedule-demo/reschedule-demo.command';
import { UpdateDemoHandler } from '../application/commands/update-demo/update-demo.handler';
import { UpdateDemoCommand } from '../application/commands/update-demo/update-demo.command';
import { GetDemoByIdHandler } from '../application/queries/get-demo-by-id/get-demo-by-id.handler';
import { GetDemoByIdQuery } from '../application/queries/get-demo-by-id/get-demo-by-id.query';
import { GetDemoListHandler } from '../application/queries/get-demo-list/get-demo-list.handler';
import { GetDemoListQuery } from '../application/queries/get-demo-list/get-demo-list.query';
import { GetDemoStatsHandler } from '../application/queries/get-demo-stats/get-demo-stats.handler';
import { GetDemoStatsQuery } from '../application/queries/get-demo-stats/get-demo-stats.query';
import { GetDemosByLeadHandler } from '../application/queries/get-demos-by-lead/get-demos-by-lead.handler';
import { GetDemosByLeadQuery } from '../application/queries/get-demos-by-lead/get-demos-by-lead.query';

// ═══════════════════════════════════════════════════════════════════════════════
// CreateDemoHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('CreateDemoHandler', () => {
  let handler: CreateDemoHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new CreateDemoHandler(prisma);
  });

  it('should create demo with calendar event and reminder', async () => {
    const result = await handler.execute(
      new CreateDemoCommand('lead-1', 'user-1', 'ONLINE', new Date(Date.now() + 86400000), 60),
    );
    expect(prisma.demo.create).toHaveBeenCalled();
    expect(prisma.calendarEvent.create).toHaveBeenCalled();
    expect(prisma.reminder.create).toHaveBeenCalled();
    expect(result.id).toBe('demo-1');
  });

  it('should update calendar event if one already exists', async () => {
    prisma.calendarEvent.findFirst.mockResolvedValue({ id: 'cal-1' });
    await handler.execute(
      new CreateDemoCommand('lead-1', 'user-1', 'ONLINE', new Date(Date.now() + 86400000), 60),
    );
    expect(prisma.calendarEvent.update).toHaveBeenCalled();
    expect(prisma.calendarEvent.create).not.toHaveBeenCalled();
  });

  it('should propagate DB error', async () => {
    prisma.demo.create.mockRejectedValue(new Error('DB error'));
    await expect(
      handler.execute(new CreateDemoCommand('lead-1', 'user-1', 'ONLINE', new Date())),
    ).rejects.toThrow('DB error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CancelDemoHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('CancelDemoHandler', () => {
  let handler: CancelDemoHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new CancelDemoHandler(prisma);
  });

  it('should cancel a demo with CANCELLED status', async () => {
    prisma.demo.update.mockResolvedValue(makeDemo({ status: 'CANCELLED' }));
    const result = await handler.execute(new CancelDemoCommand('demo-1', 'user-1', 'Not needed'));
    expect(prisma.demo.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'CANCELLED' }) }),
    );
    expect(prisma.calendarEvent.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
  });

  it('should mark as NO_SHOW when isNoShow=true', async () => {
    prisma.demo.update.mockResolvedValue(makeDemo({ status: 'NO_SHOW' }));
    const result = await handler.execute(new CancelDemoCommand('demo-1', 'user-1', 'Client absent', true));
    expect(prisma.demo.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'NO_SHOW' }) }),
    );
  });

  it('should throw NotFoundException when demo not found', async () => {
    prisma.demo.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new CancelDemoCommand('missing', 'user-1', 'reason'))).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CompleteDemoHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('CompleteDemoHandler', () => {
  let handler: CompleteDemoHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new CompleteDemoHandler(prisma);
  });

  it('should complete demo with result', async () => {
    prisma.demo.update.mockResolvedValue(makeDemo({ status: 'COMPLETED', result: 'INTERESTED' }));
    const result = await handler.execute(new CompleteDemoCommand('demo-1', 'user-1', 'INTERESTED', 'Promising lead'));
    expect(prisma.demo.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'COMPLETED', result: 'INTERESTED' }) }),
    );
  });

  it('should throw NotFoundException when demo not found', async () => {
    prisma.demo.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new CompleteDemoCommand('missing', 'user-1', 'INTERESTED'))).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RescheduleDemoHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('RescheduleDemoHandler', () => {
  let handler: RescheduleDemoHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new RescheduleDemoHandler(prisma);
  });

  it('should reschedule demo and increment rescheduleCount', async () => {
    const newDate = new Date(Date.now() + 172800000);
    prisma.demo.update.mockResolvedValue(makeDemo({ status: 'RESCHEDULED', rescheduleCount: 1 }));
    await handler.execute(new RescheduleDemoCommand('demo-1', 'user-1', newDate));
    expect(prisma.demo.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'RESCHEDULED', rescheduleCount: { increment: 1 } }) }),
    );
    expect(prisma.calendarEvent.updateMany).toHaveBeenCalled();
  });

  it('should throw NotFoundException when demo not found', async () => {
    prisma.demo.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new RescheduleDemoCommand('missing', 'user-1', new Date()))).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for completed demo', async () => {
    prisma.demo.findUnique.mockResolvedValue(makeDemo({ status: 'COMPLETED' }));
    await expect(handler.execute(new RescheduleDemoCommand('demo-1', 'user-1', new Date()))).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for cancelled demo', async () => {
    prisma.demo.findUnique.mockResolvedValue(makeDemo({ status: 'CANCELLED' }));
    await expect(handler.execute(new RescheduleDemoCommand('demo-1', 'user-1', new Date()))).rejects.toThrow(BadRequestException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// UpdateDemoHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('UpdateDemoHandler', () => {
  let handler: UpdateDemoHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new UpdateDemoHandler(prisma);
  });

  it('should update demo fields', async () => {
    prisma.demo.update.mockResolvedValue(makeDemo({ notes: 'Updated notes' }));
    const result = await handler.execute(new UpdateDemoCommand('demo-1', 'user-1', { notes: 'Updated notes' }));
    expect(prisma.demo.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'demo-1' } }),
    );
    expect(result).toBeDefined();
  });

  it('should update calendar events when scheduledAt changes', async () => {
    const newDate = new Date(Date.now() + 86400000);
    prisma.demo.update.mockResolvedValue(makeDemo({ scheduledAt: newDate }));
    await handler.execute(new UpdateDemoCommand('demo-1', 'user-1', { scheduledAt: newDate }));
    expect(prisma.calendarEvent.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { startTime: newDate } }),
    );
  });

  it('should throw NotFoundException when demo not found', async () => {
    prisma.demo.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new UpdateDemoCommand('missing', 'user-1', { notes: 'x' }))).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetDemoByIdHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetDemoByIdHandler', () => {
  let handler: GetDemoByIdHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetDemoByIdHandler(prisma);
  });

  it('should return demo by id', async () => {
    const result = await handler.execute(new GetDemoByIdQuery('demo-1'));
    expect(result.id).toBe('demo-1');
  });

  it('should throw NotFoundException when not found', async () => {
    prisma.demo.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new GetDemoByIdQuery('missing'))).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetDemoListHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetDemoListHandler', () => {
  let handler: GetDemoListHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetDemoListHandler(prisma);
  });

  it('should return paginated list of demos', async () => {
    const result = await handler.execute(new GetDemoListQuery(1, 10));
    expect(prisma.demo.findMany).toHaveBeenCalled();
    expect(prisma.demo.count).toHaveBeenCalled();
    expect(result.data).toBeDefined();
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
  });

  it('should apply status filter', async () => {
    prisma.demo.findMany.mockResolvedValue([]);
    await handler.execute(new GetDemoListQuery(1, 10, 'scheduledAt', 'desc', undefined, 'SCHEDULED'));
    expect(prisma.demo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'SCHEDULED' }) }),
    );
  });

  it('should propagate DB error', async () => {
    prisma.demo.findMany.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetDemoListQuery())).rejects.toThrow('DB error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetDemoStatsHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetDemoStatsHandler', () => {
  let handler: GetDemoStatsHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetDemoStatsHandler(prisma);
  });

  it('should return demo stats with byStatus breakdown', async () => {
    prisma.demo.groupBy
      .mockResolvedValueOnce([{ status: 'SCHEDULED', _count: 3 }])  // byStatus
      .mockResolvedValueOnce([{ result: 'INTERESTED', _count: 2 }]); // byResult
    const result = await handler.execute(new GetDemoStatsQuery('user-1'));
    expect(result.total).toBe(5);
    expect(result.byStatus).toHaveLength(1);
    expect(result.byStatus[0].status).toBe('SCHEDULED');
  });

  it('should propagate DB error', async () => {
    prisma.demo.count.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetDemoStatsQuery())).rejects.toThrow('DB error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetDemosByLeadHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetDemosByLeadHandler', () => {
  let handler: GetDemosByLeadHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetDemosByLeadHandler(prisma);
  });

  it('should return demos for a lead with tenantId isolation', async () => {
    prisma.demo.findMany.mockResolvedValue([makeDemo()]);
    prisma.demo.count.mockResolvedValue(1);
    const result = await handler.execute(new GetDemosByLeadQuery('lead-1', 1, 10));
    expect(prisma.demo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { leadId: 'lead-1' } }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should propagate DB error', async () => {
    prisma.demo.findMany.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetDemosByLeadQuery('lead-1'))).rejects.toThrow('DB error');
  });
});
