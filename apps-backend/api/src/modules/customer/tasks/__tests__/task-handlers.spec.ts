// @ts-nocheck
/**
 * Task Handlers — comprehensive unit tests
 * All handlers use this.prisma.working.X accessor pattern
 */

import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

// Commands
import { UpdateTaskHandler } from '../application/commands/update-task/update-task.handler';
import { DeleteTaskHandler } from '../application/commands/delete-task/delete-task.handler';
import { AssignTaskHandler } from '../application/commands/assign-task/assign-task.handler';
import { CompleteTaskHandler } from '../application/commands/complete-task/complete-task.handler';
import { ApproveTaskHandler } from '../application/commands/approve-task/approve-task.handler';
import { RejectTaskHandler } from '../application/commands/reject-task/reject-task.handler';
import { ChangeTaskStatusHandler } from '../application/commands/change-task-status/change-task-status.handler';
import { BulkAssignTaskHandler } from '../application/commands/bulk-assign-task/bulk-assign-task.handler';
import { AddWatcherHandler } from '../application/commands/add-watcher/add-watcher.handler';
import { RemoveWatcherHandler } from '../application/commands/remove-watcher/remove-watcher.handler';

// Queries
import { GetTaskByIdHandler } from '../application/queries/get-task-by-id/get-task-by-id.handler';
import { GetTaskListHandler } from '../application/queries/get-task-list/get-task-list.handler';
import { GetTaskStatsHandler } from '../application/queries/get-task-stats/get-task-stats.handler';
import { GetMyTasksHandler } from '../application/queries/get-my-tasks/get-my-tasks.handler';
import { GetMyTasksDashboardHandler } from '../application/queries/get-my-tasks-dashboard/get-my-tasks-dashboard.handler';
import { GetTaskHistoryHandler } from '../application/queries/get-task-history/get-task-history.handler';
import { GetTeamTasksOverviewHandler } from '../application/queries/get-team-tasks-overview/get-team-tasks-overview.handler';

// ─── shared mock data ─────────────────────────────────────────────────────────

const BASE_TASK = {
  id: 'task-1',
  taskNumber: 'TSK-0001',
  title: 'Test task',
  status: 'OPEN',
  priority: 'MEDIUM',
  isActive: true,
  tenantId: 'tenant-1',
  assignedToId: 'user-2',
  createdById: 'user-1',
  recurrence: 'NONE',
  dueDate: null,
  watchers: [],
  comments: [],
  reminders: [],
  _count: { comments: 0, watchers: 0, history: 0, reminders: 0 },
  assignedTo: { id: 'user-2', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  createdBy: { id: 'user-1', firstName: 'Admin', lastName: 'User' },
};

function makePrisma(taskOverride: any = BASE_TASK) {
  const working: any = {
    task: {
      findUnique: jest.fn().mockResolvedValue(taskOverride),
      findMany: jest.fn().mockResolvedValue([taskOverride]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(taskOverride),
      update: jest.fn().mockResolvedValue(taskOverride),
      updateMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    taskWatcher: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ taskId: 'task-1', userId: 'user-3' }),
      delete: jest.fn().mockResolvedValue({ taskId: 'task-1', userId: 'user-3' }),
    },
    taskHistory: {
      create: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    activity: { create: jest.fn().mockResolvedValue({ id: 'act-1' }) },
    calendarEvent: {
      create: jest.fn().mockResolvedValue({}),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    reminder: { create: jest.fn().mockResolvedValue({}) },
  };
  const prisma: any = { working };
  prisma.user = {
    findMany: jest.fn().mockResolvedValue([
      { id: 'user-1', firstName: 'Admin', lastName: 'User', isDeleted: false },
    ]),
  };
  return prisma;
}

// ─── UpdateTaskHandler ────────────────────────────────────────────────────────

describe('UpdateTaskHandler', () => {
  let prisma: any;
  let handler: UpdateTaskHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new UpdateTaskHandler(prisma);
  });

  it('should update task when changes exist', async () => {
    const updated = { ...BASE_TASK, title: 'Updated title' };
    prisma.working.task.update.mockResolvedValue(updated);
    const result = await handler.execute({ taskId: 'task-1', title: 'Updated title', userId: 'user-1' });
    expect(prisma.working.task.update).toHaveBeenCalled();
    expect(result.title).toBe('Updated title');
  });

  it('should return existing task when no changes', async () => {
    const result = await handler.execute({ taskId: 'task-1', title: BASE_TASK.title, userId: 'user-1' });
    // title is same so no update call
    expect(prisma.working.task.update).not.toHaveBeenCalled();
    expect(result).toEqual(BASE_TASK);
  });

  it('should throw NotFoundException when task not found', async () => {
    prisma.working.task.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ taskId: 'bad', title: 'x', userId: 'u-1' })).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when task is inactive', async () => {
    prisma.working.task.findUnique.mockResolvedValue({ ...BASE_TASK, isActive: false });
    await expect(handler.execute({ taskId: 'task-1', title: 'x', userId: 'u-1' })).rejects.toThrow(NotFoundException);
  });

  it('should record history when priority changes', async () => {
    const updated = { ...BASE_TASK, priority: 'HIGH' };
    prisma.working.task.update.mockResolvedValue(updated);
    await handler.execute({ taskId: 'task-1', priority: 'HIGH', userId: 'user-1' });
    expect(prisma.working.taskHistory.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ field: 'priority', newValue: 'HIGH' }),
        ]),
      }),
    );
  });

  it('should throw when DB fails', async () => {
    prisma.working.task.update.mockRejectedValue(new Error('DB error'));
    await expect(
      handler.execute({ taskId: 'task-1', title: 'New title', priority: 'HIGH', userId: 'u-1' }),
    ).rejects.toThrow('DB error');
  });
});

// ─── DeleteTaskHandler ────────────────────────────────────────────────────────

describe('DeleteTaskHandler', () => {
  let prisma: any;
  let handler: DeleteTaskHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new DeleteTaskHandler(prisma);
  });

  it('should soft-delete (isActive=false) a task', async () => {
    const deactivated = { ...BASE_TASK, isActive: false };
    prisma.working.task.update.mockResolvedValue(deactivated);
    const result = await handler.execute({ taskId: 'task-1' });
    expect(prisma.working.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { isActive: false },
    });
    expect(result.isActive).toBe(false);
  });

  it('should throw NotFoundException when task not found', async () => {
    prisma.working.task.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ taskId: 'bad' })).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when task already inactive', async () => {
    prisma.working.task.findUnique.mockResolvedValue({ ...BASE_TASK, isActive: false });
    await expect(handler.execute({ taskId: 'task-1' })).rejects.toThrow(NotFoundException);
  });

  it('should throw when DB update fails', async () => {
    prisma.working.task.update.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({ taskId: 'task-1' })).rejects.toThrow('DB error');
  });
});

// ─── AssignTaskHandler ────────────────────────────────────────────────────────

describe('AssignTaskHandler', () => {
  let prisma: any;
  let assignmentService: any;
  let handler: AssignTaskHandler;

  beforeEach(() => {
    prisma = makePrisma();
    assignmentService = {
      validateAssignment: jest.fn().mockResolvedValue(undefined),
    };
    handler = new AssignTaskHandler(prisma, assignmentService);
  });

  it('should assign task to new user', async () => {
    const assigned = { ...BASE_TASK, assignedToId: 'user-3', assignedTo: { id: 'user-3', firstName: 'New', lastName: 'User' } };
    prisma.working.task.update.mockResolvedValue(assigned);
    const result = await handler.execute({ taskId: 'task-1', newAssigneeId: 'user-3', userId: 'user-1', userRoleLevel: 2 });
    expect(assignmentService.validateAssignment).toHaveBeenCalledWith('user-1', 'user-3', 2);
    expect(result.assignedToId).toBe('user-3');
  });

  it('should record history after assignment', async () => {
    await handler.execute({ taskId: 'task-1', newAssigneeId: 'user-3', userId: 'user-1', userRoleLevel: 2 });
    expect(prisma.working.taskHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ field: 'assignedToId', newValue: 'user-3' }),
      }),
    );
  });

  it('should throw NotFoundException when task not found', async () => {
    prisma.working.task.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ taskId: 'bad', newAssigneeId: 'user-3', userId: 'u-1', userRoleLevel: 2 })).rejects.toThrow(NotFoundException);
  });

  it('should throw when assignment validation fails', async () => {
    assignmentService.validateAssignment.mockRejectedValue(new ForbiddenException('Not allowed'));
    await expect(handler.execute({ taskId: 'task-1', newAssigneeId: 'user-3', userId: 'user-1', userRoleLevel: 5 })).rejects.toThrow(ForbiddenException);
  });
});

// ─── CompleteTaskHandler ──────────────────────────────────────────────────────

describe('CompleteTaskHandler', () => {
  let prisma: any;
  let recurrenceService: any;
  let handler: CompleteTaskHandler;

  beforeEach(() => {
    prisma = makePrisma();
    recurrenceService = { processRecurringTasks: jest.fn().mockResolvedValue(0) };
    handler = new CompleteTaskHandler(prisma, recurrenceService);
  });

  it('should mark task as COMPLETED', async () => {
    const completed = { ...BASE_TASK, status: 'COMPLETED', completedAt: new Date() };
    prisma.working.task.update.mockResolvedValue(completed);
    const result = await handler.execute({ taskId: 'task-1', userId: 'user-2' });
    expect(result.status).toBe('COMPLETED');
  });

  it('should record status change history', async () => {
    await handler.execute({ taskId: 'task-1', userId: 'user-2' });
    expect(prisma.working.taskHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'STATUS_CHANGED', newValue: 'COMPLETED' }),
      }),
    );
  });

  it('should process recurring tasks when recurrence is set', async () => {
    prisma.working.task.findUnique.mockResolvedValue({ ...BASE_TASK, recurrence: 'WEEKLY' });
    await handler.execute({ taskId: 'task-1', userId: 'user-2' });
    expect(recurrenceService.processRecurringTasks).toHaveBeenCalled();
  });

  it('should not process recurring tasks when recurrence is NONE', async () => {
    await handler.execute({ taskId: 'task-1', userId: 'user-2' });
    expect(recurrenceService.processRecurringTasks).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when task not found', async () => {
    prisma.working.task.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ taskId: 'bad', userId: 'u-1' })).rejects.toThrow(NotFoundException);
  });

  it('should include completionNotes when provided', async () => {
    await handler.execute({ taskId: 'task-1', userId: 'user-2', completionNotes: 'Done!', actualMinutes: 60 });
    const updateCall = prisma.working.task.update.mock.calls[0][0];
    expect(updateCall.data.completionNotes).toBe('Done!');
    expect(updateCall.data.actualMinutes).toBe(60);
  });
});

// ─── ApproveTaskHandler ───────────────────────────────────────────────────────

describe('ApproveTaskHandler', () => {
  let prisma: any;
  let handler: ApproveTaskHandler;
  const pendingTask = { ...BASE_TASK, status: 'PENDING_APPROVAL', dueDate: new Date() };

  beforeEach(() => {
    prisma = makePrisma(pendingTask);
    handler = new ApproveTaskHandler(prisma);
  });

  it('should approve a pending task', async () => {
    const approved = { ...pendingTask, status: 'OPEN', approvedById: 'manager-1' };
    prisma.working.task.update.mockResolvedValue(approved);
    const result = await handler.execute({ id: 'task-1', userId: 'manager-1', tenantId: 'tenant-1' });
    expect(result.status).toBe('OPEN');
  });

  it('should record history after approval', async () => {
    await handler.execute({ id: 'task-1', userId: 'manager-1', tenantId: 'tenant-1' });
    expect(prisma.working.taskHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ oldValue: 'PENDING_APPROVAL', newValue: 'OPEN' }),
      }),
    );
  });

  it('should throw NotFoundException when task not found', async () => {
    prisma.working.task.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ id: 'bad', userId: 'manager-1', tenantId: 'tenant-1' })).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when task is not PENDING_APPROVAL', async () => {
    prisma.working.task.findUnique.mockResolvedValue({ ...BASE_TASK, status: 'OPEN' });
    await expect(handler.execute({ id: 'task-1', userId: 'manager-1', tenantId: 'tenant-1' })).rejects.toThrow(BadRequestException);
  });
});

// ─── RejectTaskHandler ────────────────────────────────────────────────────────

describe('RejectTaskHandler', () => {
  let prisma: any;
  let handler: RejectTaskHandler;
  const pendingTask = { ...BASE_TASK, status: 'PENDING_APPROVAL' };

  beforeEach(() => {
    prisma = makePrisma(pendingTask);
    handler = new RejectTaskHandler(prisma);
  });

  it('should reject a pending task', async () => {
    const rejected = { ...pendingTask, status: 'CANCELLED', rejectedReason: 'Not needed' };
    prisma.working.task.update.mockResolvedValue(rejected);
    const result = await handler.execute({ id: 'task-1', userId: 'manager-1', reason: 'Not needed' });
    expect(result.status).toBe('CANCELLED');
  });

  it('should record rejection history', async () => {
    await handler.execute({ id: 'task-1', userId: 'manager-1', reason: 'Duplicate' });
    expect(prisma.working.taskHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ oldValue: 'PENDING_APPROVAL', newValue: 'CANCELLED' }),
      }),
    );
  });

  it('should throw NotFoundException when task not found', async () => {
    prisma.working.task.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ id: 'bad', userId: 'manager-1', reason: '' })).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when task is not PENDING_APPROVAL', async () => {
    prisma.working.task.findUnique.mockResolvedValue({ ...BASE_TASK, status: 'OPEN' });
    await expect(handler.execute({ id: 'task-1', userId: 'manager-1', reason: 'x' })).rejects.toThrow(BadRequestException);
  });
});

// ─── ChangeTaskStatusHandler ──────────────────────────────────────────────────

describe('ChangeTaskStatusHandler', () => {
  let prisma: any;
  let taskLogic: any;
  let handler: ChangeTaskStatusHandler;
  const openTask = { ...BASE_TASK, status: 'OPEN' };

  beforeEach(() => {
    prisma = makePrisma(openTask);
    taskLogic = { getConfig: jest.fn().mockResolvedValue(null) };
    handler = new ChangeTaskStatusHandler(prisma, taskLogic);
  });

  it('should transition from OPEN to IN_PROGRESS', async () => {
    const inProgress = { ...openTask, status: 'IN_PROGRESS' };
    prisma.working.task.update.mockResolvedValue(inProgress);
    const result = await handler.execute({ taskId: 'task-1', newStatus: 'IN_PROGRESS', userId: 'user-2' });
    expect(result.status).toBe('IN_PROGRESS');
  });

  it('should reject invalid transition (OPEN -> COMPLETED)', async () => {
    await expect(handler.execute({ taskId: 'task-1', newStatus: 'COMPLETED', userId: 'u-1' })).rejects.toThrow(BadRequestException);
  });

  it('should set completedAt when transitioning to COMPLETED from IN_PROGRESS', async () => {
    prisma.working.task.findUnique.mockResolvedValue({ ...BASE_TASK, status: 'IN_PROGRESS' });
    const completed = { ...BASE_TASK, status: 'COMPLETED', completedAt: new Date() };
    prisma.working.task.update.mockResolvedValue(completed);
    await handler.execute({ taskId: 'task-1', newStatus: 'COMPLETED', userId: 'u-1' });
    const updateData = prisma.working.task.update.mock.calls[0][0].data;
    expect(updateData.completedAt).toBeInstanceOf(Date);
  });

  it('should throw NotFoundException when task not found', async () => {
    prisma.working.task.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ taskId: 'bad', newStatus: 'IN_PROGRESS', userId: 'u-1' })).rejects.toThrow(NotFoundException);
  });

  it('should record status change history', async () => {
    await handler.execute({ taskId: 'task-1', newStatus: 'IN_PROGRESS', userId: 'user-2' });
    expect(prisma.working.taskHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ field: 'status', oldValue: 'OPEN', newValue: 'IN_PROGRESS' }),
      }),
    );
  });
});

// ─── BulkAssignTaskHandler ────────────────────────────────────────────────────

describe('BulkAssignTaskHandler', () => {
  let prisma: any;
  let handler: BulkAssignTaskHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new BulkAssignTaskHandler(prisma);
  });

  it('should bulk assign tasks when user is admin (roleLevel <= 1)', async () => {
    prisma.working.task.updateMany.mockResolvedValue({ count: 3 });
    const result = await handler.execute({ taskIds: ['t1', 't2', 't3'], assignedToId: 'user-5', userId: 'admin-1', roleLevel: 0, tenantId: 'tenant-1' });
    expect(result.updated).toBe(3);
  });

  it('should create history records for each task', async () => {
    await handler.execute({ taskIds: ['t1', 't2'], assignedToId: 'user-5', userId: 'admin-1', roleLevel: 1, tenantId: 'tenant-1' });
    expect(prisma.working.taskHistory.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ taskId: 't1', action: 'REASSIGNED' }),
        ]),
      }),
    );
  });

  it('should throw ForbiddenException when non-admin tries bulk assign', async () => {
    await expect(
      handler.execute({ taskIds: ['t1'], assignedToId: 'user-5', userId: 'user-2', roleLevel: 3, tenantId: 'tenant-1' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should filter by tenantId and isActive', async () => {
    await handler.execute({ taskIds: ['t1'], assignedToId: 'user-5', userId: 'admin-1', roleLevel: 0, tenantId: 'tenant-1' });
    expect(prisma.working.task.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-1', isActive: true }) }),
    );
  });
});

// ─── AddWatcherHandler ────────────────────────────────────────────────────────

describe('AddWatcherHandler', () => {
  let prisma: any;
  let resolver: any;
  let handler: AddWatcherHandler;

  beforeEach(() => {
    prisma = makePrisma();
    resolver = { resolveUser: jest.fn().mockResolvedValue({ id: 'user-3', firstName: 'Bob', lastName: 'Smith' }) };
    handler = new AddWatcherHandler(prisma, resolver);
  });

  it('should add watcher to task', async () => {
    const watcher = { taskId: 'task-1', userId: 'user-3' };
    prisma.working.taskWatcher.create.mockResolvedValue(watcher);
    const result = await handler.execute({ taskId: 'task-1', watcherUserId: 'user-3' });
    expect(prisma.working.taskWatcher.create).toHaveBeenCalled();
    expect(result.user).toBeDefined();
  });

  it('should throw ConflictException if already watching', async () => {
    prisma.working.taskWatcher.findUnique.mockResolvedValue({ taskId: 'task-1', userId: 'user-3' });
    const { ConflictException } = await import('@nestjs/common');
    await expect(handler.execute({ taskId: 'task-1', watcherUserId: 'user-3' })).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException when task not found', async () => {
    prisma.working.task.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ taskId: 'bad', watcherUserId: 'user-3' })).rejects.toThrow(NotFoundException);
  });
});

// ─── RemoveWatcherHandler ─────────────────────────────────────────────────────

describe('RemoveWatcherHandler', () => {
  let prisma: any;
  let handler: RemoveWatcherHandler;

  beforeEach(() => {
    prisma = makePrisma();
    prisma.working.taskWatcher.findUnique.mockResolvedValue({ taskId: 'task-1', userId: 'user-3' });
    handler = new RemoveWatcherHandler(prisma);
  });

  it('should remove watcher from task', async () => {
    const deleted = { taskId: 'task-1', userId: 'user-3' };
    prisma.working.taskWatcher.delete.mockResolvedValue(deleted);
    const result = await handler.execute({ taskId: 'task-1', watcherUserId: 'user-3' });
    expect(prisma.working.taskWatcher.delete).toHaveBeenCalled();
    expect(result.userId).toBe('user-3');
  });

  it('should throw NotFoundException when watcher not found', async () => {
    prisma.working.taskWatcher.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ taskId: 'task-1', watcherUserId: 'user-99' })).rejects.toThrow(NotFoundException);
  });
});

// ─── GetTaskByIdHandler ───────────────────────────────────────────────────────

describe('GetTaskByIdHandler', () => {
  let prisma: any;
  let resolver: any;
  let handler: GetTaskByIdHandler;

  beforeEach(() => {
    prisma = makePrisma();
    resolver = {
      resolveUser: jest.fn().mockResolvedValue({ id: 'user-1', firstName: 'Admin', lastName: 'User' }),
      resolveUsers: jest.fn().mockResolvedValue([]),
    };
    handler = new GetTaskByIdHandler(prisma, resolver);
  });

  it('should return task with resolved user refs', async () => {
    const result = await handler.execute({ taskId: 'task-1', userId: 'user-1' });
    expect(result.id).toBe('task-1');
    expect(resolver.resolveUser).toHaveBeenCalledTimes(2);
  });

  it('should throw NotFoundException when task not found', async () => {
    prisma.working.task.findUnique.mockResolvedValue(null);
    await expect(handler.execute({ taskId: 'bad', userId: 'u-1' })).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when task is inactive', async () => {
    prisma.working.task.findUnique.mockResolvedValue({ ...BASE_TASK, isActive: false });
    await expect(handler.execute({ taskId: 'task-1', userId: 'u-1' })).rejects.toThrow(NotFoundException);
  });
});

// ─── GetTaskListHandler ───────────────────────────────────────────────────────

describe('GetTaskListHandler', () => {
  let prisma: any;
  let visibility: any;
  let handler: GetTaskListHandler;

  beforeEach(() => {
    prisma = makePrisma();
    visibility = {
      buildWhereClause: jest.fn().mockResolvedValue({ tenantId: 'tenant-1', isActive: true }),
    };
    prisma.working.task.findMany.mockResolvedValue([BASE_TASK]);
    prisma.working.task.count.mockResolvedValue(1);
    handler = new GetTaskListHandler(prisma, visibility);
  });

  it('should return paginated tasks', async () => {
    const result = await handler.execute({
      userId: 'user-1', roleLevel: 2, tenantId: 'tenant-1',
      page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc',
    });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
  });

  it('should filter by tenantId via visibility service', async () => {
    await handler.execute({ userId: 'user-1', roleLevel: 2, tenantId: 'tenant-1', page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
    expect(visibility.buildWhereClause).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'tenant-1' }),
    );
  });

  it('should apply status filter when provided', async () => {
    await handler.execute({ userId: 'user-1', roleLevel: 2, tenantId: 'tenant-1', page: 1, limit: 20, status: 'OPEN', sortBy: 'createdAt', sortOrder: 'desc' });
    const findManyCall = prisma.working.task.findMany.mock.calls[0][0];
    expect(findManyCall.where.status).toBe('OPEN');
  });

  it('should throw when DB fails', async () => {
    prisma.working.task.findMany.mockRejectedValue(new Error('DB error'));
    await expect(
      handler.execute({ userId: 'u-1', roleLevel: 2, tenantId: 'tenant-1', page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }),
    ).rejects.toThrow('DB error');
  });
});

// ─── GetTaskStatsHandler ──────────────────────────────────────────────────────

describe('GetTaskStatsHandler', () => {
  let prisma: any;
  let visibility: any;
  let handler: GetTaskStatsHandler;

  beforeEach(() => {
    prisma = makePrisma();
    visibility = { buildWhereClause: jest.fn().mockResolvedValue({ tenantId: 'tenant-1', isActive: true }) };
    prisma.working.task.count.mockResolvedValue(5);
    handler = new GetTaskStatsHandler(prisma, visibility);
  });

  it('should return task stats with all status counts', async () => {
    const result = await handler.execute({ userId: 'user-1', roleLevel: 2, tenantId: 'tenant-1' });
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('open');
    expect(result).toHaveProperty('inProgress');
    expect(result).toHaveProperty('completed');
    expect(result).toHaveProperty('overdue');
    expect(result).toHaveProperty('cancelled');
    expect(result).toHaveProperty('onHold');
  });

  it('should call visibility service to filter by tenant', async () => {
    await handler.execute({ userId: 'user-1', roleLevel: 2, tenantId: 'tenant-1' });
    expect(visibility.buildWhereClause).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tenant-1' }));
  });

  it('should throw when DB fails', async () => {
    prisma.working.task.count.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({ userId: 'u-1', roleLevel: 2, tenantId: 'tenant-1' })).rejects.toThrow('DB error');
  });
});

// ─── GetMyTasksHandler ────────────────────────────────────────────────────────

describe('GetMyTasksHandler', () => {
  let prisma: any;
  let handler: GetMyTasksHandler;

  beforeEach(() => {
    prisma = makePrisma();
    prisma.working.task.findMany.mockResolvedValue([BASE_TASK]);
    prisma.working.task.count.mockResolvedValue(1);
    handler = new GetMyTasksHandler(prisma);
  });

  it('should return tasks assigned to the requesting user', async () => {
    const result = await handler.execute({ userId: 'user-2', page: 1, limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should filter by userId as assignedToId', async () => {
    await handler.execute({ userId: 'user-2', page: 1, limit: 20 });
    const findManyCall = prisma.working.task.findMany.mock.calls[0][0];
    expect(findManyCall.where.assignedToId).toBe('user-2');
  });

  it('should apply optional status filter', async () => {
    await handler.execute({ userId: 'user-2', page: 1, limit: 20, status: 'IN_PROGRESS' });
    const findManyCall = prisma.working.task.findMany.mock.calls[0][0];
    expect(findManyCall.where.status).toBe('IN_PROGRESS');
  });
});

// ─── GetMyTasksDashboardHandler ───────────────────────────────────────────────

describe('GetMyTasksDashboardHandler', () => {
  let prisma: any;
  let handler: GetMyTasksDashboardHandler;

  beforeEach(() => {
    prisma = makePrisma();
    prisma.working.task.findMany.mockResolvedValue([BASE_TASK]);
    handler = new GetMyTasksDashboardHandler(prisma);
  });

  it('should return dashboard sections', async () => {
    const result = await handler.execute({ userId: 'user-2', tenantId: 'tenant-1' });
    expect(result).toHaveProperty('overdue');
    expect(result).toHaveProperty('dueToday');
    expect(result).toHaveProperty('upcoming');
    expect(result).toHaveProperty('recentlyCompleted');
    expect(result).toHaveProperty('counts');
  });

  it('should filter all queries by tenantId and userId', async () => {
    await handler.execute({ userId: 'user-2', tenantId: 'tenant-1' });
    const calls = prisma.working.task.findMany.mock.calls;
    for (const call of calls) {
      expect(call[0].where.tenantId).toBe('tenant-1');
      expect(call[0].where.assignedToId).toBe('user-2');
    }
  });

  it('should throw when DB fails', async () => {
    prisma.working.task.findMany.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute({ userId: 'u-1', tenantId: 'tenant-1' })).rejects.toThrow('DB error');
  });
});

// ─── GetTaskHistoryHandler ────────────────────────────────────────────────────

describe('GetTaskHistoryHandler', () => {
  let prisma: any;
  let handler: GetTaskHistoryHandler;
  const mockHistory = [{ id: 'h-1', taskId: 'task-1', field: 'status', oldValue: 'OPEN', newValue: 'IN_PROGRESS' }];

  beforeEach(() => {
    prisma = makePrisma();
    prisma.working.taskHistory.findMany.mockResolvedValue(mockHistory);
    prisma.working.taskHistory.count.mockResolvedValue(1);
    handler = new GetTaskHistoryHandler(prisma);
  });

  it('should return paginated task history', async () => {
    const result = await handler.execute({ taskId: 'task-1', page: 1, limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should filter history by taskId', async () => {
    await handler.execute({ taskId: 'task-1', page: 1, limit: 20 });
    expect(prisma.working.taskHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { taskId: 'task-1' } }),
    );
  });
});

// ─── GetTeamTasksOverviewHandler ──────────────────────────────────────────────

describe('GetTeamTasksOverviewHandler', () => {
  let prisma: any;
  let assignmentService: any;
  let handler: GetTeamTasksOverviewHandler;

  beforeEach(() => {
    prisma = makePrisma();
    prisma.user = {
      findMany: jest.fn().mockResolvedValue([
        { id: 'user-1', firstName: 'Admin', lastName: 'User' },
        { id: 'user-2', firstName: 'John', lastName: 'Doe' },
      ]),
    };
    prisma.working.task.count.mockResolvedValue(2);
    assignmentService = { getReporteeIds: jest.fn().mockResolvedValue(['user-2']) };
    handler = new GetTeamTasksOverviewHandler(prisma, assignmentService);
  });

  it('should return overview for manager (roleLevel <= 3)', async () => {
    const result = await handler.execute({ userId: 'user-1', roleLevel: 2, tenantId: 'tenant-1' });
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('userId');
    expect(result[0]).toHaveProperty('pending');
  });

  it('should throw ForbiddenException for regular users (roleLevel > 3)', async () => {
    await expect(
      handler.execute({ userId: 'user-5', roleLevel: 4, tenantId: 'tenant-1' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should get reportee IDs for manager', async () => {
    await handler.execute({ userId: 'user-1', roleLevel: 2, tenantId: 'tenant-1' });
    expect(assignmentService.getReporteeIds).toHaveBeenCalledWith('user-1');
  });
});
