import { CreateTaskHandler } from '../../application/commands/create-task/create-task.handler';
import { CreateTaskCommand } from '../../application/commands/create-task/create-task.command';

const mockTask = {
  id: 'task-1',
  taskNumber: 'TSK-0001',
  title: 'Follow up with client',
  status: 'OPEN',
  isActive: true,
  assignedTo: { id: 'u-2', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  createdBy: { id: 'u-1', firstName: 'Admin', lastName: 'User' },
};

function makeHandler(taskOverride: any = mockTask, assignmentError?: Error) {
  const prisma: any = {
    task: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(taskOverride),
    },
    taskWatcher: { create: jest.fn().mockResolvedValue({}) },
    taskHistory: { create: jest.fn().mockResolvedValue({}) },
    activity: { create: jest.fn().mockResolvedValue({ id: 'act-1' }) },
    reminder: { create: jest.fn().mockResolvedValue({}) },
    calendarEvent: { create: jest.fn().mockResolvedValue({}) },
  };
  prisma.working = prisma;

  const assignmentService: any = {
    validateAssignment: assignmentError
      ? jest.fn().mockRejectedValue(assignmentError)
      : jest.fn().mockResolvedValue(undefined),
  };

  const recurrenceService: any = {
    calculateNextDate: jest.fn().mockReturnValue(new Date('2026-04-01')),
  };

  return { handler: new CreateTaskHandler(prisma, assignmentService, recurrenceService), prisma, assignmentService, recurrenceService };
}

const baseCmd = (overrides: Partial<CreateTaskCommand> = {}) =>
  new CreateTaskCommand(
    overrides.title ?? 'Follow up with client',
    overrides.createdById ?? 'u-1',
    overrides.creatorRoleLevel ?? 2,
    overrides.tenantId ?? 'tenant-1',
    overrides.assignedToId,
    overrides.description,
    overrides.type,
    undefined, // customTaskType
    undefined, // priority
    undefined, // assignmentScope
    undefined, // assignedDepartmentId
    undefined, // assignedDesignationId
    undefined, // assignedRoleId
    overrides.dueDate,
    undefined, // dueTime
    undefined, // startDate
    overrides.recurrence,
  );

describe('CreateTaskHandler', () => {
  it('should create a task and return it', async () => {
    const { handler } = makeHandler();
    const result = await handler.execute(baseCmd());
    expect(result.taskNumber).toBe('TSK-0001');
    expect(result.title).toBe('Follow up with client');
  });

  it('should generate task number based on count', async () => {
    const { handler, prisma } = makeHandler();
    prisma.task.count.mockResolvedValue(4);
    await handler.execute(baseCmd());
    const createCall = prisma.task.create.mock.calls[0][0].data;
    expect(createCall.taskNumber).toBe('TSK-0005');
  });

  it('should set status OPEN for manager-created tasks (roleLevel < 4)', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(baseCmd({ creatorRoleLevel: 2 }));
    const createCall = prisma.task.create.mock.calls[0][0].data;
    expect(createCall.status).toBe('OPEN');
  });

  it('should set status PENDING_APPROVAL for non-manager self-assigned tasks (roleLevel >= 4)', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(baseCmd({ creatorRoleLevel: 4 }));
    const createCall = prisma.task.create.mock.calls[0][0].data;
    expect(createCall.status).toBe('PENDING_APPROVAL');
  });

  it('should call validateAssignment when assignedToId differs from createdById', async () => {
    const { handler, assignmentService } = makeHandler();
    await handler.execute(baseCmd({ assignedToId: 'u-2', createdById: 'u-1' }));
    expect(assignmentService.validateAssignment).toHaveBeenCalledWith(
      'u-1', 'u-2', 2, 'SPECIFIC_USER', undefined, undefined, undefined,
    );
  });

  it('should not call validateAssignment when assignedToId equals createdById', async () => {
    const { handler, assignmentService } = makeHandler();
    await handler.execute(baseCmd({ assignedToId: 'u-1', createdById: 'u-1' }));
    expect(assignmentService.validateAssignment).not.toHaveBeenCalled();
  });

  it('should auto-add creator as watcher when assignee is different', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(baseCmd({ assignedToId: 'u-2', createdById: 'u-1' }));
    expect(prisma.taskWatcher.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'u-1' }) }),
    );
  });

  it('should not add watcher when creator is self-assigned', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(baseCmd({ assignedToId: 'u-1', createdById: 'u-1' }));
    expect(prisma.taskWatcher.create).not.toHaveBeenCalled();
  });

  it('should record task creation in history', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(baseCmd());
    expect(prisma.taskHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'CREATED', field: 'status' }),
      }),
    );
  });

  it('should calculate nextRecurrenceDate when recurrence and dueDate provided', async () => {
    const dueDate = new Date('2026-03-25');
    const { handler, prisma, recurrenceService } = makeHandler();
    await handler.execute(baseCmd({ dueDate, recurrence: 'WEEKLY' }));
    expect(recurrenceService.calculateNextDate).toHaveBeenCalledWith(dueDate, 'WEEKLY');
    const createCall = prisma.task.create.mock.calls[0][0].data;
    expect(createCall.nextRecurrenceDate).toEqual(new Date('2026-04-01'));
  });

  it('should create calendar event when dueDate provided', async () => {
    const dueDate = new Date('2026-03-25');
    const { handler, prisma } = makeHandler();
    await handler.execute(baseCmd({ dueDate }));
    expect(prisma.calendarEvent.create).toHaveBeenCalled();
  });

  it('should create reminder when reminderMinutesBefore provided with dueDate', async () => {
    const dueDate = new Date('2026-03-25T10:00:00Z');
    const { handler, prisma } = makeHandler();
    const cmd = new CreateTaskCommand(
      'Test', 'u-1', 2, 'tenant-1',
      undefined, undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined,
      dueDate,
      undefined, undefined, undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined, 30,
    );
    await handler.execute(cmd);
    expect(prisma.reminder.create).toHaveBeenCalled();
  });

  it('should not create reminder when no dueDate', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(baseCmd());
    expect(prisma.reminder.create).not.toHaveBeenCalled();
  });
});
