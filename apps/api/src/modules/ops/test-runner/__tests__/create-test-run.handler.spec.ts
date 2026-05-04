import { BadRequestException } from '@nestjs/common';
import { CreateTestRunHandler } from '../application/commands/create-test-run/create-test-run.handler';
import { CreateTestRunCommand } from '../application/commands/create-test-run/create-test-run.command';
import { TEST_RUN_REPOSITORY } from '../infrastructure/repositories/test-run.repository';

const mockRepo = {
  countRunning: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByTenantId: jest.fn(),
  update: jest.fn(),
  countActive: jest.fn(),
  findWithResults: jest.fn(),
};

const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: 'job-1' }),
};

function buildHandler() {
  return new CreateTestRunHandler(mockRepo as any, mockQueue as any);
}

describe('CreateTestRunHandler', () => {
  afterEach(() => jest.clearAllMocks());

  it('throws BadRequestException when 2+ runs already active', async () => {
    mockRepo.countRunning.mockResolvedValue(2);

    await expect(
      buildHandler().execute(new CreateTestRunCommand('t-1', 'u-1', [], [], 'AUTO')),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(mockQueue.add).not.toHaveBeenCalled();
  });

  it('creates test run and queues BullMQ job on success', async () => {
    mockRepo.countRunning.mockResolvedValue(0);
    mockRepo.create.mockResolvedValue({ id: 'run-uuid', testTypes: ['UNIT'], targetModules: [] });

    const result = await buildHandler().execute(
      new CreateTestRunCommand('t-1', 'u-1', ['UNIT', 'SMOKE'], [], 'AUTO'),
    );

    expect(result).toEqual({ id: 'run-uuid', status: 'QUEUED' });
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: 't-1',
      createdById: 'u-1',
      runType: 'AUTO',
      testTypes: ['UNIT', 'SMOKE'],
    }));
    expect(mockQueue.add).toHaveBeenCalledWith('RUN_TESTS', { testRunId: 'run-uuid' }, expect.any(Object));
  });

  it('defaults to all 6 test types when testTypes is empty', async () => {
    mockRepo.countRunning.mockResolvedValue(0);
    mockRepo.create.mockImplementation(async (data: any) => ({ id: 'run-2', ...data }));

    await buildHandler().execute(new CreateTestRunCommand('t-1', 'u-1', [], [], 'AUTO'));

    const createArg = mockRepo.create.mock.calls[0][0];
    expect(createArg.testTypes).toHaveLength(6);
    expect(createArg.testTypes).toContain('UNIT');
    expect(createArg.testTypes).toContain('PENETRATION');
  });

  it('passes testEnvId when provided', async () => {
    mockRepo.countRunning.mockResolvedValue(0);
    mockRepo.create.mockResolvedValue({ id: 'run-3', testTypes: [], targetModules: [] });

    await buildHandler().execute(
      new CreateTestRunCommand('t-1', 'u-1', [], [], 'AUTO', 'env-uuid-456'),
    );

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ testEnvId: 'env-uuid-456' }),
    );
  });

  it('allows concurrent runs below limit (1 running)', async () => {
    mockRepo.countRunning.mockResolvedValue(1);
    mockRepo.create.mockResolvedValue({ id: 'run-4', testTypes: [], targetModules: [] });

    await expect(
      buildHandler().execute(new CreateTestRunCommand('t-1', 'u-1', [], [], 'AUTO')),
    ).resolves.toBeDefined();
  });
});
