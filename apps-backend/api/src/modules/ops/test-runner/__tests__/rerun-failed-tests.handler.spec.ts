import { NotFoundException } from '@nestjs/common';
import { RerunFailedTestsHandler } from '../application/commands/rerun-failed-tests/rerun-failed-tests.handler';
import { RerunFailedTestsCommand } from '../application/commands/rerun-failed-tests/rerun-failed-tests.command';

const mockRepo = {
  findById: jest.fn(),
  create: jest.fn(),
  countRunning: jest.fn(),
  update: jest.fn(),
  findByTenantId: jest.fn(),
  findWithResults: jest.fn(),
};

const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: 'job-rerun' }),
};

const mockPrisma = {
  platform: {
    testResult: {
      findMany: jest.fn(),
    },
  },
};

function buildHandler() {
  return new RerunFailedTestsHandler(mockRepo as any, mockQueue as any, mockPrisma as any);
}

const sourceRun = {
  id: 'source-run',
  tenantId: 'tenant-1',
  testEnvId: null,
  testTypes: ['UNIT', 'SMOKE', 'INTEGRATION'],
  targetModules: [],
};

describe('RerunFailedTestsHandler', () => {
  afterEach(() => jest.clearAllMocks());

  it('throws NotFoundException when source run not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      buildHandler().execute(new RerunFailedTestsCommand('t-1', 'u-1', 'missing-id')),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates new run with only failed modules', async () => {
    mockRepo.findById.mockResolvedValue(sourceRun);
    mockRepo.create.mockResolvedValue({ id: 'rerun-uuid', testTypes: [], targetModules: [] });
    mockPrisma.platform.testResult.findMany.mockResolvedValue([
      { module: 'leads', testType: 'UNIT' },
      { module: 'contacts', testType: 'UNIT' },
      { module: 'leads', testType: 'INTEGRATION' },
    ]);

    const result = await buildHandler().execute(
      new RerunFailedTestsCommand('t-1', 'u-1', 'source-run'),
    );

    expect(result).toEqual({ id: 'rerun-uuid', status: 'QUEUED' });
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        runType: 'RERUN',
        targetModules: expect.arrayContaining(['leads', 'contacts']),
      }),
    );
  });

  it('runs only failed test types', async () => {
    mockRepo.findById.mockResolvedValue(sourceRun);
    mockRepo.create.mockResolvedValue({ id: 'rerun-2', testTypes: [], targetModules: [] });
    mockPrisma.platform.testResult.findMany.mockResolvedValue([
      { module: 'leads', testType: 'UNIT' },
    ]);

    await buildHandler().execute(new RerunFailedTestsCommand('t-1', 'u-1', 'source-run'));

    const createArg = mockRepo.create.mock.calls[0][0];
    expect(createArg.testTypes).toEqual(['UNIT']); // Only UNIT had failures
  });

  it('queues BullMQ job for the new run', async () => {
    mockRepo.findById.mockResolvedValue(sourceRun);
    mockRepo.create.mockResolvedValue({ id: 'rerun-3', testTypes: [], targetModules: [] });
    mockPrisma.platform.testResult.findMany.mockResolvedValue([
      { module: 'leads', testType: 'UNIT' },
    ]);

    await buildHandler().execute(new RerunFailedTestsCommand('t-1', 'u-1', 'source-run'));

    expect(mockQueue.add).toHaveBeenCalledWith('RUN_TESTS', { testRunId: 'rerun-3' }, expect.any(Object));
  });

  it('falls back to source test types when no failed results found', async () => {
    mockRepo.findById.mockResolvedValue(sourceRun);
    mockRepo.create.mockResolvedValue({ id: 'rerun-4', testTypes: [], targetModules: [] });
    mockPrisma.platform.testResult.findMany.mockResolvedValue([]);

    await buildHandler().execute(new RerunFailedTestsCommand('t-1', 'u-1', 'source-run'));

    const createArg = mockRepo.create.mock.calls[0][0];
    expect(createArg.testTypes).toEqual(sourceRun.testTypes);
  });
});
