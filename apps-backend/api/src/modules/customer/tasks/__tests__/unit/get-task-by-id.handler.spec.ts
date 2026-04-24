import { NotFoundException } from '@nestjs/common';
import { GetTaskByIdHandler } from '../../application/queries/get-task-by-id/get-task-by-id.handler';
import { GetTaskByIdQuery } from '../../application/queries/get-task-by-id/get-task-by-id.query';

const mockUser1 = { id: 'u-1', firstName: 'Admin', lastName: 'User', email: 'admin@example.com' };
const mockUser2 = { id: 'u-2', firstName: 'John', lastName: 'Doe', email: 'john@example.com' };

const mockTask = {
  id: 'task-1',
  taskNumber: 'TSK-0001',
  title: 'Follow up with client',
  status: 'OPEN',
  isActive: true,
  assignedToId: 'u-2',
  createdById: 'u-1',
  watchers: [{ id: 'w-1', userId: 'u-2' }],
  comments: [{ id: 'c-1', authorId: 'u-1', body: 'test' }],
  reminders: [],
  _count: { comments: 1, watchers: 1, history: 1, reminders: 0 },
};

function makeHandler(taskResult: any = mockTask) {
  const prisma: any = {
    task: {
      findUnique: jest.fn().mockResolvedValue(taskResult),
    },
  };
  prisma.working = prisma;
  const resolver: any = {
    resolveUser: jest.fn().mockImplementation((id) => {
      if (id === 'u-1') return Promise.resolve(mockUser1);
      if (id === 'u-2') return Promise.resolve(mockUser2);
      return Promise.resolve(null);
    }),
    resolveUsers: jest.fn().mockImplementation((records, fkFields) => {
      return Promise.resolve(records.map((r: any) => {
        const merged = { ...r };
        for (const fk of fkFields) {
          const name = fk.replace(/Id$/, '');
          const uid = r[fk];
          merged[name] = uid === 'u-1' ? mockUser1 : uid === 'u-2' ? mockUser2 : null;
        }
        return merged;
      }));
    }),
  };
  return { handler: new GetTaskByIdHandler(prisma, resolver), prisma, resolver };
}

describe('GetTaskByIdHandler', () => {
  it('should return task when found and active', async () => {
    const { handler } = makeHandler();
    const result = await handler.execute(new GetTaskByIdQuery('task-1', 'u-1'));
    expect(result.id).toBe('task-1');
    expect(result.taskNumber).toBe('TSK-0001');
  });

  it('should resolve cross-DB user references', async () => {
    const { handler, resolver } = makeHandler();
    const result = await handler.execute(new GetTaskByIdQuery('task-1', 'u-1'));
    expect(resolver.resolveUser).toHaveBeenCalledWith('u-2');
    expect(resolver.resolveUser).toHaveBeenCalledWith('u-1');
    expect(result.assignedTo).toEqual(mockUser2);
    expect(result.createdBy).toEqual(mockUser1);
    expect((result.watchers[0] as any).user).toEqual(mockUser2);
    expect((result.comments[0] as any).author).toEqual(mockUser1);
  });

  it('should include relations in the query', async () => {
    const { handler, prisma } = makeHandler();
    await handler.execute(new GetTaskByIdQuery('task-1', 'u-1'));
    const call = prisma.task.findUnique.mock.calls[0][0];
    expect(call.where.id).toBe('task-1');
    expect(call.include).toBeDefined();
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

  it('should handle null assignedToId gracefully', async () => {
    const { handler } = makeHandler({ ...mockTask, assignedToId: null });
    const result = await handler.execute(new GetTaskByIdQuery('task-1', 'u-1'));
    expect(result.assignedTo).toBeNull();
  });
});
