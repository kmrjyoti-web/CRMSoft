import { NotFoundException } from '@nestjs/common';
import { GetTaskByIdHandler } from '../../application/queries/get-task-by-id/get-task-by-id.handler';
import { GetTaskByIdQuery } from '../../application/queries/get-task-by-id/get-task-by-id.query';

const mockTask = {
  id: 'task-1',
  taskNumber: 'TSK-0001',
  title: 'Follow up with client',
  status: 'OPEN',
  isActive: true,
  assignedTo: { id: 'u-2', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  createdBy: { id: 'u-1', firstName: 'Admin', lastName: 'User' },
  watchers: [],
  comments: [],
  reminders: [],
  _count: { comments: 0, watchers: 0, history: 1, reminders: 0 },
};

function makeHandler(taskResult: any = mockTask) {
  const prisma: any = {
    task: {
      findUnique: jest.fn().mockResolvedValue(taskResult),
    },
  };
  prisma.working = prisma;
  return { handler: new GetTaskByIdHandler(prisma), prisma };
}

describe('GetTaskByIdHandler', () => {
  it('should return task when found and active', async () => {
    const { handler } = makeHandler();
    const result = await handler.execute(new GetTaskByIdQuery('task-1', 'u-1'));
    expect(result.id).toBe('task-1');
    expect(result.taskNumber).toBe('TSK-0001');
  });

  it('should include relations in the query', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(new GetTaskByIdQuery('task-1', 'u-1'));
    const call = prisma.task.findUnique.mock.calls[0][0];
    expect(call.where.id).toBe('task-1');
    expect(call.include).toBeDefined();
    expect(call.include.assignedTo).toBeDefined();
    expect(call.include.watchers).toBeDefined();
    expect(call.include.comments).toBeDefined();
  });

  it('should throw NotFoundException when task does not exist', async () => {
    const { handler } = makeHandler(null);
    await expect(handler.execute(new GetTaskByIdQuery('no-such-id', 'u-1'))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException for inactive tasks', async () => {
    const { handler } = makeHandler({ ...mockTask, isActive: false });
    await expect(handler.execute(new GetTaskByIdQuery('task-1', 'u-1'))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should include _count in query include', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(new GetTaskByIdQuery('task-1', 'u-1'));
    const call = prisma.task.findUnique.mock.calls[0][0];
    expect(call.include._count).toBeDefined();
  });
});
