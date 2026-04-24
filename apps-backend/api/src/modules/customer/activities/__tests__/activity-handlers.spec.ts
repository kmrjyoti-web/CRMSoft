// @ts-nocheck
import { NotFoundException, BadRequestException } from '@nestjs/common';

// ─── Shared fixtures ─────────────────────────────────────────────────────────
const makeActivity = (overrides: any = {}) => ({
  id: 'act-1',
  type: 'CALL',
  subject: 'Follow up call',
  tenantId: 'tenant-1',
  isActive: true,
  isDeleted: false,
  scheduledAt: null,
  createdById: 'user-1',
  lead: { id: 'lead-1', leadNumber: 'L001', status: 'NEW' },
  contact: null,
  createdByUser: { id: 'user-1', firstName: 'Raj', lastName: 'Patel', email: 'raj@test.com' },
  ...overrides,
});

const makePrisma = () => {
  const p: any = {
    activity: {
      findMany: jest.fn().mockResolvedValue([makeActivity()]),
      findUnique: jest.fn().mockResolvedValue(makeActivity()),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(makeActivity()),
      update: jest.fn().mockResolvedValue(makeActivity()),
      delete: jest.fn().mockResolvedValue(makeActivity()),
      count: jest.fn().mockResolvedValue(1),
      groupBy: jest.fn().mockResolvedValue([{ type: 'CALL', _count: 1 }]),
    },
    task: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'task-1', taskNumber: 'TSK-0001' }),
    },
    taskWatcher: { create: jest.fn().mockResolvedValue({}) },
    taskHistory: { create: jest.fn().mockResolvedValue({}) },
    reminder: { create: jest.fn().mockResolvedValue({}) },
    calendarEvent: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    communication: { updateMany: jest.fn() },
  };
  p.working = p;
  p.user = { findUnique: jest.fn().mockResolvedValue({ id: 'user-1', firstName: 'Raj', lastName: 'Patel' }) };
  return p;
};

const mockResolver = {
  resolveUser: jest.fn().mockResolvedValue({ id: 'user-1', firstName: 'Raj', lastName: 'Patel' }),
};
const mockChannelRouter = { send: jest.fn().mockResolvedValue({}) };

// ─── Imports ─────────────────────────────────────────────────────────────────
import { CreateActivityHandler } from '../application/commands/create-activity/create-activity.handler';
import { CompleteActivityHandler } from '../application/commands/complete-activity/complete-activity.handler';
import { UpdateActivityHandler } from '../application/commands/update-activity/update-activity.handler';
import { DeleteActivityHandler } from '../application/commands/delete-activity/delete-activity.handler';
import { DeactivateActivityHandler } from '../application/commands/deactivate-activity/deactivate-activity.handler';
import { ReactivateActivityHandler } from '../application/commands/reactivate-activity/reactivate-activity.handler';
import { SoftDeleteActivityHandler } from '../application/commands/soft-delete-activity/soft-delete-activity.handler';
import { RestoreActivityHandler } from '../application/commands/restore-activity/restore-activity.handler';
import { PermanentDeleteActivityHandler } from '../application/commands/permanent-delete-activity/permanent-delete-activity.handler';
import { GetActivitiesByEntityHandler } from '../application/queries/get-activities-by-entity/get-activities-by-entity.handler';
import { GetActivityByIdHandler } from '../application/queries/get-activity-by-id/get-activity-by-id.handler';
import { GetActivityListHandler } from '../application/queries/get-activity-list/get-activity-list.handler';
import { GetActivityStatsHandler } from '../application/queries/get-activity-stats/get-activity-stats.handler';

// ═══════════════════════════════════════════════════════════════════════════════
// CreateActivityHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('CreateActivityHandler', () => {
  let handler: CreateActivityHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new CreateActivityHandler(prisma, mockChannelRouter as any);
  });

  it('should create activity and return it', async () => {
    const result = await handler.execute({
      type: 'CALL', subject: 'Follow up', userId: 'user-1', tenantId: 'tenant-1',
    } as any);
    expect(prisma.activity.create).toHaveBeenCalled();
    expect(result.id).toBe('act-1');
  });

  it('should create calendar event when scheduledAt is provided', async () => {
    await handler.execute({
      type: 'CALL', subject: 'Follow up', userId: 'user-1',
      scheduledAt: new Date(Date.now() + 86400000),
    } as any);
    expect(prisma.calendarEvent.create).toHaveBeenCalled();
  });

  it('should create task+reminder when reminderMinutesBefore provided', async () => {
    await handler.execute({
      type: 'CALL', subject: 'Follow up', userId: 'user-1',
      scheduledAt: new Date(Date.now() + 86400000),
      reminderMinutesBefore: 15,
    } as any);
    expect(prisma.task.create).toHaveBeenCalled();
    expect(prisma.reminder.create).toHaveBeenCalled();
  });

  it('should propagate DB error', async () => {
    prisma.activity.create.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({ type: 'CALL', subject: 'x', userId: 'u1' } as any)).rejects.toThrow('DB error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CompleteActivityHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('CompleteActivityHandler', () => {
  let handler: CompleteActivityHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new CompleteActivityHandler(prisma, mockResolver as any);
  });

  it('should complete activity with outcome', async () => {
    prisma.activity.update.mockResolvedValue(makeActivity({ completedAt: new Date(), outcome: 'Interested' }));
    const result = await handler.execute({ id: 'act-1', outcome: 'Interested' } as any);
    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ outcome: 'Interested' }) }),
    );
    expect(result).toBeDefined();
  });

  it('should throw NotFoundException when activity not found', async () => {
    prisma.activity.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ id: 'bad-id', outcome: 'x' } as any)).rejects.toThrow(NotFoundException);
  });

  it('should propagate DB error', async () => {
    prisma.activity.findUnique.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({ id: 'act-1' } as any)).rejects.toThrow('DB error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// UpdateActivityHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('UpdateActivityHandler', () => {
  let handler: UpdateActivityHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new UpdateActivityHandler(prisma, mockResolver as any);
  });

  it('should update activity fields', async () => {
    prisma.activity.update.mockResolvedValue(makeActivity({ subject: 'Updated Subject' }));
    await handler.execute({ id: 'act-1', data: { subject: 'Updated Subject' } } as any);
    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'act-1' } }),
    );
  });

  it('should throw NotFoundException when activity not found', async () => {
    prisma.activity.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ id: 'missing', data: {} } as any)).rejects.toThrow(NotFoundException);
  });

  it('should update calendar event when scheduledAt provided', async () => {
    const scheduledAt = new Date(Date.now() + 86400000);
    prisma.activity.update.mockResolvedValue(makeActivity({ scheduledAt }));
    prisma.calendarEvent.findFirst.mockResolvedValue({ id: 'cal-1' });
    await handler.execute({ id: 'act-1', data: { scheduledAt } } as any);
    expect(prisma.calendarEvent.update).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DeleteActivityHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('DeleteActivityHandler', () => {
  let handler: DeleteActivityHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new DeleteActivityHandler(prisma);
  });

  it('should delete activity and deactivate calendar events', async () => {
    const result = await handler.execute({ id: 'act-1' } as any);
    expect(prisma.activity.delete).toHaveBeenCalledWith({ where: { id: 'act-1' } });
    expect(prisma.calendarEvent.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
    expect(result).toEqual({ id: 'act-1', deleted: true });
  });

  it('should throw NotFoundException when activity not found', async () => {
    prisma.activity.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ id: 'missing' } as any)).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DeactivateActivityHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('DeactivateActivityHandler', () => {
  let handler: DeactivateActivityHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new DeactivateActivityHandler(prisma);
  });

  it('should deactivate an active activity', async () => {
    await handler.execute({ activityId: 'act-1' } as any);
    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isActive: false }) }),
    );
  });

  it('should throw NotFoundException when not found', async () => {
    prisma.activity.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ activityId: 'missing' } as any)).rejects.toThrow(NotFoundException);
  });

  it('should throw if already inactive', async () => {
    prisma.activity.findUnique.mockResolvedValue(makeActivity({ isActive: false }));
    await expect(handler.execute({ activityId: 'act-1' } as any)).rejects.toThrow('Activity is already inactive');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ReactivateActivityHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('ReactivateActivityHandler', () => {
  let handler: ReactivateActivityHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new ReactivateActivityHandler(prisma);
  });

  it('should reactivate an inactive activity', async () => {
    prisma.activity.findUnique.mockResolvedValue(makeActivity({ isActive: false }));
    await handler.execute({ activityId: 'act-1' } as any);
    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isActive: true }) }),
    );
  });

  it('should throw NotFoundException when not found', async () => {
    prisma.activity.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ activityId: 'missing' } as any)).rejects.toThrow(NotFoundException);
  });

  it('should throw if already active', async () => {
    await expect(handler.execute({ activityId: 'act-1' } as any)).rejects.toThrow('Activity is already active');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SoftDeleteActivityHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('SoftDeleteActivityHandler', () => {
  let handler: SoftDeleteActivityHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new SoftDeleteActivityHandler(prisma);
  });

  it('should soft-delete an activity', async () => {
    await handler.execute({ activityId: 'act-1', deletedById: 'user-1' } as any);
    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isDeleted: true, isActive: false }) }),
    );
  });

  it('should throw NotFoundException when not found', async () => {
    prisma.activity.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ activityId: 'missing', deletedById: 'u1' } as any)).rejects.toThrow(NotFoundException);
  });

  it('should throw if already soft-deleted', async () => {
    prisma.activity.findUnique.mockResolvedValue(makeActivity({ isDeleted: true }));
    await expect(handler.execute({ activityId: 'act-1', deletedById: 'u1' } as any)).rejects.toThrow('Activity is already deleted');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RestoreActivityHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('RestoreActivityHandler', () => {
  let handler: RestoreActivityHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new RestoreActivityHandler(prisma);
  });

  it('should restore a soft-deleted activity', async () => {
    prisma.activity.findUnique.mockResolvedValue(makeActivity({ isDeleted: true }));
    await handler.execute({ activityId: 'act-1' } as any);
    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isDeleted: false, isActive: true }) }),
    );
  });

  it('should throw NotFoundException when not found', async () => {
    prisma.activity.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ activityId: 'missing' } as any)).rejects.toThrow(NotFoundException);
  });

  it('should throw if activity is not deleted', async () => {
    await expect(handler.execute({ activityId: 'act-1' } as any)).rejects.toThrow('Activity is not deleted');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PermanentDeleteActivityHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('PermanentDeleteActivityHandler', () => {
  let handler: PermanentDeleteActivityHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new PermanentDeleteActivityHandler(prisma);
  });

  it('should permanently delete a soft-deleted activity', async () => {
    prisma.activity.findUnique.mockResolvedValue(makeActivity({ isDeleted: true }));
    await handler.execute({ activityId: 'act-1' } as any);
    expect(prisma.activity.delete).toHaveBeenCalledWith({ where: { id: 'act-1' } });
    expect(prisma.calendarEvent.updateMany).toHaveBeenCalled();
  });

  it('should throw NotFoundException when not found', async () => {
    prisma.activity.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ activityId: 'missing' } as any)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if not soft-deleted first', async () => {
    await expect(handler.execute({ activityId: 'act-1' } as any)).rejects.toThrow(BadRequestException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetActivitiesByEntityHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetActivitiesByEntityHandler', () => {
  let handler: GetActivitiesByEntityHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetActivitiesByEntityHandler(prisma);
  });

  it('should query by leadId when entityType=LEAD', async () => {
    const result = await handler.execute({ entityType: 'LEAD', entityId: 'lead-1', page: 1, limit: 10 } as any);
    expect(prisma.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { leadId: 'lead-1' } }),
    );
    expect(result.data).toBeDefined();
    expect(result.total).toBe(1);
  });

  it('should query by contactId when entityType=CONTACT', async () => {
    await handler.execute({ entityType: 'CONTACT', entityId: 'contact-1', page: 1, limit: 10 } as any);
    expect(prisma.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { contactId: 'contact-1' } }),
    );
  });

  it('should propagate DB error', async () => {
    prisma.activity.findMany.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({ entityType: 'LEAD', entityId: 'l1', page: 1, limit: 10 } as any)).rejects.toThrow('DB error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetActivityByIdHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetActivityByIdHandler', () => {
  let handler: GetActivityByIdHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetActivityByIdHandler(prisma);
  });

  it('should return activity by id', async () => {
    const result = await handler.execute({ id: 'act-1' } as any);
    expect(result.id).toBe('act-1');
  });

  it('should throw NotFoundException when not found', async () => {
    prisma.activity.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ id: 'missing' } as any)).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetActivityListHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetActivityListHandler', () => {
  let handler: GetActivityListHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetActivityListHandler(prisma);
  });

  it('should return paginated activity list', async () => {
    const result = await handler.execute({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' } as any);
    expect(prisma.activity.findMany).toHaveBeenCalled();
    expect(prisma.activity.count).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should propagate DB error', async () => {
    prisma.activity.findMany.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' } as any)).rejects.toThrow('DB error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetActivityStatsHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetActivityStatsHandler', () => {
  let handler: GetActivityStatsHandler;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    handler = new GetActivityStatsHandler(prisma);
  });

  it('should return activity stats with completion rate', async () => {
    prisma.activity.count
      .mockResolvedValueOnce(10)  // total
      .mockResolvedValueOnce(7);   // completed
    prisma.activity.groupBy.mockResolvedValue([{ type: 'CALL', _count: 7 }]);

    const result = await handler.execute({ userId: 'user-1' } as any);
    expect(result.total).toBe(10);
    expect(result.completed).toBe(7);
    expect(result.pending).toBe(3);
    expect(result.completionRate).toBe(70);
    expect(result.byType).toHaveLength(1);
  });

  it('should return 0 completionRate when total is 0', async () => {
    prisma.activity.count.mockResolvedValue(0);
    prisma.activity.groupBy.mockResolvedValue([]);
    const result = await handler.execute({} as any);
    expect(result.completionRate).toBe(0);
  });

  it('should propagate DB error', async () => {
    prisma.activity.count.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({} as any)).rejects.toThrow('DB error');
  });
});
