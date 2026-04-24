// @ts-nocheck
/**
 * Follow-Up Handlers — comprehensive unit tests
 * All handlers use this.prisma.working.followUp accessor pattern
 */

import { NotFoundException } from '@nestjs/common';

import { CreateFollowUpHandler } from '../application/commands/create-follow-up/create-follow-up.handler';
import { UpdateFollowUpHandler } from '../application/commands/update-follow-up/update-follow-up.handler';
import { CompleteFollowUpHandler } from '../application/commands/complete-follow-up/complete-follow-up.handler';
import { DeleteFollowUpHandler } from '../application/commands/delete-follow-up/delete-follow-up.handler';
import { ReassignFollowUpHandler } from '../application/commands/reassign-follow-up/reassign-follow-up.handler';
import { SnoozeFollowUpHandler } from '../application/commands/snooze-follow-up/snooze-follow-up.handler';

import { GetFollowUpByIdHandler } from '../application/queries/get-follow-up-by-id/get-follow-up-by-id.handler';
import { GetFollowUpListHandler } from '../application/queries/get-follow-up-list/get-follow-up-list.handler';
import { GetFollowUpStatsHandler } from '../application/queries/get-follow-up-stats/get-follow-up-stats.handler';
import { GetOverdueFollowUpsHandler } from '../application/queries/get-overdue-follow-ups/get-overdue-follow-ups.handler';

// ─── shared mock data ─────────────────────────────────────────────────────────

const MOCK_FOLLOW_UP = {
  id: 'fu-1',
  title: 'Call client',
  description: 'Follow up on the demo',
  dueDate: new Date('2026-05-01'),
  priority: 'HIGH',
  entityType: 'LEAD',
  entityId: 'lead-1',
  assignedToId: 'user-2',
  createdById: 'user-1',
  isActive: true,
  isOverdue: false,
  completedAt: null,
  snoozedUntil: null,
  assignedTo: { id: 'user-2', firstName: 'John', lastName: 'Doe' },
  createdBy: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
};

function makePrisma(followUpOverride: any = MOCK_FOLLOW_UP) {
  const working: any = {
    followUp: {
      create: jest.fn().mockResolvedValue(followUpOverride),
      findUnique: jest.fn().mockResolvedValue(followUpOverride),
      findMany: jest.fn().mockResolvedValue([followUpOverride]),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockResolvedValue(followUpOverride),
      groupBy: jest.fn().mockResolvedValue([{ priority: 'HIGH', _count: 1 }]),
    },
    reminder: { create: jest.fn().mockResolvedValue({ id: 'rem-1' }) },
  };
  return { working, reminder: { create: jest.fn().mockResolvedValue({ id: 'rem-1' }) } } as any;
}

// ─── CreateFollowUpHandler ────────────────────────────────────────────────────

describe('CreateFollowUpHandler', () => {
  let prisma: any;
  let handler: CreateFollowUpHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new CreateFollowUpHandler(prisma);
  });

  it('should create a follow-up and return it', async () => {
    const result = await handler.execute({
      title: 'Call client',
      dueDate: new Date('2026-05-01'),
      assignedToId: 'user-2',
      createdById: 'user-1',
      entityType: 'LEAD',
      entityId: 'lead-1',
      priority: 'HIGH',
    });
    expect(prisma.working.followUp.create).toHaveBeenCalled();
    expect(result.id).toBe('fu-1');
    expect(result.title).toBe('Call client');
  });

  it('should pass all fields to Prisma create', async () => {
    await handler.execute({
      title: 'Call client',
      dueDate: new Date('2026-05-01'),
      assignedToId: 'user-2',
      createdById: 'user-1',
      entityType: 'LEAD',
      entityId: 'lead-1',
      description: 'Follow up',
      priority: 'MEDIUM',
    });
    const createCall = prisma.working.followUp.create.mock.calls[0][0];
    expect(createCall.data.entityType).toBe('LEAD');
    expect(createCall.data.entityId).toBe('lead-1');
  });

  it('should default priority to MEDIUM when not provided', async () => {
    await handler.execute({
      title: 'Call', dueDate: new Date(), assignedToId: 'u-2', createdById: 'u-1',
      entityType: 'LEAD', entityId: 'e-1',
    });
    const createCall = prisma.working.followUp.create.mock.calls[0][0];
    expect(createCall.data.priority).toBe('MEDIUM');
  });

  it('should create auto-reminder after follow-up creation', async () => {
    await handler.execute({
      title: 'Call client',
      dueDate: new Date('2026-05-01'),
      assignedToId: 'user-2',
      createdById: 'user-1',
      entityType: 'LEAD',
      entityId: 'lead-1',
    });
    expect(prisma.reminder.create).toHaveBeenCalled();
  });

  it('should throw and propagate DB errors', async () => {
    prisma.working.followUp.create.mockRejectedValue(new Error('DB error'));
    await expect(
      handler.execute({ title: 'x', dueDate: new Date(), assignedToId: 'u-2', createdById: 'u-1', entityType: 'LEAD', entityId: 'e-1' }),
    ).rejects.toThrow('DB error');
  });
});

// ─── UpdateFollowUpHandler ────────────────────────────────────────────────────

describe('UpdateFollowUpHandler', () => {
  let prisma: any;
  let handler: UpdateFollowUpHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new UpdateFollowUpHandler(prisma);
  });

  it('should update follow-up with provided data', async () => {
    const updated = { ...MOCK_FOLLOW_UP, title: 'Updated call' };
    prisma.working.followUp.update.mockResolvedValue(updated);
    const result = await handler.execute({ id: 'fu-1', data: { title: 'Updated call' } });
    expect(result.title).toBe('Updated call');
    expect(prisma.working.followUp.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'fu-1' } }),
    );
  });

  it('should throw NotFoundException when follow-up not found', async () => {
    prisma.working.followUp.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ id: 'bad', data: { title: 'x' } })).rejects.toThrow(NotFoundException);
  });

  it('should throw when DB update fails', async () => {
    prisma.working.followUp.update.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({ id: 'fu-1', data: { title: 'x' } })).rejects.toThrow('DB error');
  });
});

// ─── CompleteFollowUpHandler ──────────────────────────────────────────────────

describe('CompleteFollowUpHandler', () => {
  let prisma: any;
  let handler: CompleteFollowUpHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new CompleteFollowUpHandler(prisma);
  });

  it('should mark follow-up as completed', async () => {
    const completed = { ...MOCK_FOLLOW_UP, completedAt: new Date(), isOverdue: false };
    prisma.working.followUp.update.mockResolvedValue(completed);
    const result = await handler.execute({ id: 'fu-1' });
    expect(result.completedAt).toBeDefined();
    expect(result.isOverdue).toBe(false);
  });

  it('should call update with completedAt and isOverdue:false', async () => {
    await handler.execute({ id: 'fu-1' });
    const updateCall = prisma.working.followUp.update.mock.calls[0][0];
    expect(updateCall.data.completedAt).toBeInstanceOf(Date);
    expect(updateCall.data.isOverdue).toBe(false);
  });

  it('should throw NotFoundException when follow-up not found', async () => {
    prisma.working.followUp.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ id: 'bad' })).rejects.toThrow(NotFoundException);
  });
});

// ─── DeleteFollowUpHandler ────────────────────────────────────────────────────

describe('DeleteFollowUpHandler', () => {
  let prisma: any;
  let handler: DeleteFollowUpHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new DeleteFollowUpHandler(prisma);
  });

  it('should soft-delete follow-up', async () => {
    prisma.working.followUp.update.mockResolvedValue({ ...MOCK_FOLLOW_UP, isActive: false });
    const result = await handler.execute({ id: 'fu-1' });
    expect(result).toEqual({ id: 'fu-1', deleted: true });
  });

  it('should set isActive to false', async () => {
    await handler.execute({ id: 'fu-1' });
    expect(prisma.working.followUp.update).toHaveBeenCalledWith({
      where: { id: 'fu-1' },
      data: { isActive: false },
    });
  });

  it('should throw NotFoundException when follow-up not found', async () => {
    prisma.working.followUp.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ id: 'bad' })).rejects.toThrow(NotFoundException);
  });
});

// ─── ReassignFollowUpHandler ──────────────────────────────────────────────────

describe('ReassignFollowUpHandler', () => {
  let prisma: any;
  let handler: ReassignFollowUpHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new ReassignFollowUpHandler(prisma);
  });

  it('should reassign follow-up to new user', async () => {
    const reassigned = { ...MOCK_FOLLOW_UP, assignedToId: 'user-5' };
    prisma.working.followUp.update.mockResolvedValue(reassigned);
    const result = await handler.execute({ id: 'fu-1', newAssigneeId: 'user-5' });
    expect(result.assignedToId).toBe('user-5');
  });

  it('should update assignedToId in Prisma', async () => {
    await handler.execute({ id: 'fu-1', newAssigneeId: 'user-5' });
    expect(prisma.working.followUp.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { assignedToId: 'user-5' } }),
    );
  });

  it('should throw NotFoundException when follow-up not found', async () => {
    prisma.working.followUp.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ id: 'bad', newAssigneeId: 'user-5' })).rejects.toThrow(NotFoundException);
  });
});

// ─── SnoozeFollowUpHandler ────────────────────────────────────────────────────

describe('SnoozeFollowUpHandler', () => {
  let prisma: any;
  let handler: SnoozeFollowUpHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new SnoozeFollowUpHandler(prisma);
  });

  it('should snooze follow-up to given date', async () => {
    const snoozedUntil = new Date('2026-05-10');
    const snoozed = { ...MOCK_FOLLOW_UP, snoozedUntil, isOverdue: false };
    prisma.working.followUp.update.mockResolvedValue(snoozed);
    const result = await handler.execute({ id: 'fu-1', snoozedUntil });
    expect(result.snoozedUntil).toEqual(snoozedUntil);
    expect(result.isOverdue).toBe(false);
  });

  it('should set snoozedUntil and isOverdue:false in update', async () => {
    const snoozedUntil = new Date('2026-05-10');
    await handler.execute({ id: 'fu-1', snoozedUntil });
    expect(prisma.working.followUp.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { snoozedUntil, isOverdue: false } }),
    );
  });

  it('should throw NotFoundException when follow-up not found', async () => {
    prisma.working.followUp.findUnique.mockResolvedValue(null);
    const snoozedUntil = new Date();
    await expect(handler.execute({ id: 'bad', snoozedUntil })).rejects.toThrow(NotFoundException);
  });
});

// ─── GetFollowUpByIdHandler ───────────────────────────────────────────────────

describe('GetFollowUpByIdHandler', () => {
  let prisma: any;
  let handler: GetFollowUpByIdHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new GetFollowUpByIdHandler(prisma);
  });

  it('should return follow-up by id with includes', async () => {
    const result = await handler.execute({ id: 'fu-1' });
    expect(result.id).toBe('fu-1');
    expect(prisma.working.followUp.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'fu-1' } }),
    );
  });

  it('should throw NotFoundException when follow-up not found', async () => {
    prisma.working.followUp.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ id: 'bad' })).rejects.toThrow(NotFoundException);
  });
});

// ─── GetFollowUpListHandler ───────────────────────────────────────────────────

describe('GetFollowUpListHandler', () => {
  let prisma: any;
  let handler: GetFollowUpListHandler;

  beforeEach(() => {
    prisma = makePrisma();
    prisma.working.followUp.findMany.mockResolvedValue([MOCK_FOLLOW_UP]);
    prisma.working.followUp.count.mockResolvedValue(1);
    handler = new GetFollowUpListHandler(prisma);
  });

  it('should return paginated follow-up list', async () => {
    const result = await handler.execute({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
  });

  it('should filter by isActive:true by default', async () => {
    await handler.execute({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
    const call = prisma.working.followUp.findMany.mock.calls[0][0];
    expect(call.where.isActive).toBe(true);
  });

  it('should apply assignedToId filter', async () => {
    await handler.execute({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc', assignedToId: 'user-2' });
    const call = prisma.working.followUp.findMany.mock.calls[0][0];
    expect(call.where.assignedToId).toBe('user-2');
  });

  it('should apply priority filter', async () => {
    await handler.execute({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc', priority: 'HIGH' });
    const call = prisma.working.followUp.findMany.mock.calls[0][0];
    expect(call.where.priority).toBe('HIGH');
  });

  it('should apply isOverdue filter when provided', async () => {
    await handler.execute({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc', isOverdue: true });
    const call = prisma.working.followUp.findMany.mock.calls[0][0];
    expect(call.where.isOverdue).toBe(true);
  });

  it('should throw when DB fails', async () => {
    prisma.working.followUp.findMany.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' })).rejects.toThrow('DB error');
  });
});

// ─── GetFollowUpStatsHandler ──────────────────────────────────────────────────

describe('GetFollowUpStatsHandler', () => {
  let prisma: any;
  let handler: GetFollowUpStatsHandler;

  beforeEach(() => {
    prisma = makePrisma();
    prisma.working.followUp.count.mockResolvedValue(10);
    prisma.working.followUp.groupBy.mockResolvedValue([{ priority: 'HIGH', _count: 5 }]);
    handler = new GetFollowUpStatsHandler(prisma);
  });

  it('should return stats with total, completed, overdue, pending', async () => {
    const result = await handler.execute({ userId: 'user-1' });
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('completed');
    expect(result).toHaveProperty('overdue');
    expect(result).toHaveProperty('pending');
    expect(result).toHaveProperty('byPriority');
  });

  it('should filter by userId when provided', async () => {
    await handler.execute({ userId: 'user-1' });
    const countCalls = prisma.working.followUp.count.mock.calls;
    expect(countCalls[0][0].where.assignedToId).toBe('user-1');
  });

  it('should return stats without userId filter when not provided', async () => {
    await handler.execute({});
    const countCalls = prisma.working.followUp.count.mock.calls;
    expect(countCalls[0][0].where.assignedToId).toBeUndefined();
  });

  it('should throw when DB fails', async () => {
    prisma.working.followUp.count.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({ userId: 'u-1' })).rejects.toThrow('DB error');
  });
});

// ─── GetOverdueFollowUpsHandler ───────────────────────────────────────────────

describe('GetOverdueFollowUpsHandler', () => {
  let prisma: any;
  let handler: GetOverdueFollowUpsHandler;

  beforeEach(() => {
    prisma = makePrisma();
    prisma.working.followUp.findMany.mockResolvedValue([{ ...MOCK_FOLLOW_UP, isOverdue: true }]);
    prisma.working.followUp.count.mockResolvedValue(1);
    handler = new GetOverdueFollowUpsHandler(prisma);
  });

  it('should return paginated overdue follow-ups', async () => {
    const result = await handler.execute({ page: 1, limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should filter by isOverdue:true and completedAt:null', async () => {
    await handler.execute({ page: 1, limit: 20 });
    const call = prisma.working.followUp.findMany.mock.calls[0][0];
    expect(call.where.isOverdue).toBe(true);
    expect(call.where.completedAt).toBeNull();
  });

  it('should filter by assignedToId when provided', async () => {
    await handler.execute({ page: 1, limit: 20, assignedToId: 'user-2' });
    const call = prisma.working.followUp.findMany.mock.calls[0][0];
    expect(call.where.assignedToId).toBe('user-2');
  });

  it('should throw when DB fails', async () => {
    prisma.working.followUp.findMany.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({ page: 1, limit: 20 })).rejects.toThrow('DB error');
  });
});
