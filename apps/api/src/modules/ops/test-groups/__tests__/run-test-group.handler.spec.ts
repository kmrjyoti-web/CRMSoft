import { NotFoundException } from '@nestjs/common';
import { RunTestGroupHandler } from '../application/commands/run-test-group/run-test-group.handler';
import { RunTestGroupCommand } from '../application/commands/run-test-group/run-test-group.command';

const mockRepo = {
  findById: jest.fn(),
};

const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: 'job-123' }),
};

const mockPrisma = {
  platform: {
    testGroupExecution: {
      create: jest.fn(),
    },
  },
};

function buildHandler() {
  return new RunTestGroupHandler(mockRepo as any, mockQueue as any, mockPrisma as any);
}

describe('RunTestGroupHandler', () => {
  afterEach(() => jest.clearAllMocks());

  it('should throw NotFoundException when test group does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);
    const handler = buildHandler();

    const cmd = new RunTestGroupCommand('tenant-001', 'user-001', 'nonexistent-group-id');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
    await expect(handler.execute(cmd)).rejects.toThrow('TestGroup not found');
  });

  it('should create execution record with correct step count', async () => {
    const group = {
      id: 'group-abc',
      name: 'Invoice Testing',
      steps: [
        { id: 'step-01', name: 'Step 1', endpoint: 'POST /api/v1/invoices' },
        { id: 'step-02', name: 'Step 2', endpoint: 'PATCH /api/v1/invoices/send' },
        { id: 'step-03', name: 'Step 3', endpoint: 'POST /api/v1/payments' },
      ],
    };
    mockRepo.findById.mockResolvedValue(group);
    mockPrisma.platform.testGroupExecution.create.mockResolvedValue({ id: 'exec-001' });
    const handler = buildHandler();

    await handler.execute(new RunTestGroupCommand('tenant-001', 'user-001', 'group-abc'));

    expect(mockPrisma.platform.testGroupExecution.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        testGroupId: 'group-abc',
        tenantId: 'tenant-001',
        totalSteps: 3,
        executedById: 'user-001',
      }),
    });
  });

  it('should add RUN_TEST_GROUP job to queue with executionId', async () => {
    const group = { id: 'group-abc', name: 'Test Group', steps: [{ id: 's1', name: 'S1', endpoint: 'POST /x' }] };
    mockRepo.findById.mockResolvedValue(group);
    mockPrisma.platform.testGroupExecution.create.mockResolvedValue({ id: 'exec-222' });
    const handler = buildHandler();

    await handler.execute(new RunTestGroupCommand('tenant-001', 'user-001', 'group-abc'));

    expect(mockQueue.add).toHaveBeenCalledWith(
      'RUN_TEST_GROUP',
      { executionId: 'exec-222' },
      expect.objectContaining({ attempts: 1 }),
    );
  });

  it('should return executionId and RUNNING status', async () => {
    const group = { id: 'group-xyz', name: 'Quick Test', steps: [{ id: 's1', name: 'S1', endpoint: 'GET /x' }] };
    mockRepo.findById.mockResolvedValue(group);
    mockPrisma.platform.testGroupExecution.create.mockResolvedValue({ id: 'exec-999' });
    const handler = buildHandler();

    const result = await handler.execute(
      new RunTestGroupCommand('tenant-001', 'user-001', 'group-xyz', 'env-001'),
    );

    expect(result).toEqual({ executionId: 'exec-999', status: 'RUNNING' });
  });

  it('should pass testEnvId to execution record when provided', async () => {
    const group = { id: 'group-abc', name: 'Group', steps: [{ id: 's1', name: 'S1', endpoint: 'GET /x' }] };
    mockRepo.findById.mockResolvedValue(group);
    mockPrisma.platform.testGroupExecution.create.mockResolvedValue({ id: 'exec-555' });
    const handler = buildHandler();

    await handler.execute(new RunTestGroupCommand('tenant-001', 'user-001', 'group-abc', 'test-env-id'));

    expect(mockPrisma.platform.testGroupExecution.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ testEnvId: 'test-env-id' }),
    });
  });
});
