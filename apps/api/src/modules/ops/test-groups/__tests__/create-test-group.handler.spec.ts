import { BadRequestException } from '@nestjs/common';
import { CreateTestGroupHandler } from '../application/commands/create-test-group/create-test-group.handler';
import { CreateTestGroupCommand } from '../application/commands/create-test-group/create-test-group.command';

const mockRepo = {
  create: jest.fn(),
};

function buildHandler() {
  return new CreateTestGroupHandler(mockRepo as any);
}

describe('CreateTestGroupHandler', () => {
  afterEach(() => jest.clearAllMocks());

  it('should create a test group with valid steps', async () => {
    mockRepo.create.mockResolvedValue({ id: 'group-abc', name: 'Invoice Testing' });
    const handler = buildHandler();

    const cmd = new CreateTestGroupCommand('tenant-001', 'user-001', {
      name: 'Invoice Testing',
      description: 'Tests invoice flow',
      modules: ['payment'],
      steps: [
        {
          id: 'step-01',
          name: 'Create Invoice',
          endpoint: 'POST /api/v1/invoices',
          assertions: [{ field: 'status', operator: 'eq', expected: 201 }],
        },
      ],
    });

    const result = await handler.execute(cmd);
    expect(result).toEqual({ id: 'group-abc', name: 'Invoice Testing' });
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
  });

  it('should throw BadRequestException when steps is empty', async () => {
    const handler = buildHandler();

    const cmd = new CreateTestGroupCommand('tenant-001', 'user-001', {
      name: 'Empty Group',
      modules: ['payment'],
      steps: [],
    });

    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(cmd)).rejects.toThrow('at least one step');
  });

  it('should throw BadRequestException when a step is missing id', async () => {
    const handler = buildHandler();

    const cmd = new CreateTestGroupCommand('tenant-001', 'user-001', {
      name: 'Invalid Step Group',
      modules: ['payment'],
      steps: [{ name: 'Step without ID', endpoint: 'POST /api/v1/items', assertions: [] } as any],
    });

    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(cmd)).rejects.toThrow('id, name, endpoint');
  });

  it('should throw BadRequestException when a step is missing name', async () => {
    const handler = buildHandler();

    const cmd = new CreateTestGroupCommand('tenant-001', 'user-001', {
      name: 'Invalid Step Group',
      modules: ['payment'],
      steps: [{ id: 'step-01', endpoint: 'POST /api/v1/items', assertions: [] } as any],
    });

    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when a step is missing endpoint', async () => {
    const handler = buildHandler();

    const cmd = new CreateTestGroupCommand('tenant-001', 'user-001', {
      name: 'Invalid Step Group',
      modules: ['payment'],
      steps: [{ id: 'step-01', name: 'Missing Endpoint', assertions: [] } as any],
    });

    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });
});
